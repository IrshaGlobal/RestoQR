/**
 * Migration Script: Category Templates to Global Customizations
 * 
 * This script migrates existing category-level customization templates
 * to the new global customization system.
 * 
 * Usage: npx tsx scripts/migrate-to-global-customizations.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as fs from 'fs'

// Load environment variables from .env file
const envPath = path.resolve(__dirname, '../.env')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=')
      const value = valueParts.join('=').trim()
      if (key && value) {
        process.env[key.trim()] = value.replace(/^['"]|['"]$/g, '')
      }
    }
  })
}

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Missing Supabase configuration in .env file')
  console.error('Required: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface CategoryTemplate {
  id: string
  name: string
  type: 'addon' | 'removal' | 'substitution'
  default_price: number
  is_required?: boolean
  max_selections?: number
}

interface Category {
  id: string
  restaurant_id: string
  name: string
  customization_templates: CategoryTemplate[]
}

interface MenuItem {
  id: string
  restaurant_id: string
  category_id: string
  name: string
  customization_config?: any[]
}

async function migrateCustomizations() {
  console.log('🚀 Starting migration: Category Templates → Global Customizations\n')

  try {
    // Step 1: Fetch all categories with templates
    console.log('📋 Step 1: Fetching categories with customization templates...')
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('*')
      .not('customization_templates', 'eq', '[]')
      .not('customization_templates', 'is', null)

    if (catError) {
      console.error('❌ Error fetching categories:', catError)
      return
    }

    if (!categories || categories.length === 0) {
      console.log('✅ No categories with templates found. Migration complete.')
      return
    }

    console.log(`   Found ${categories.length} categories with templates\n`)

    // Step 2: Migrate category templates to global customizations
    console.log('🔄 Step 2: Migrating templates to global customizations...')
    const templateToGlobalIdMap = new Map<string, string>()
    let migratedCount = 0
    let skippedCount = 0

    for (const category of categories) {
      console.log(`   Processing category: ${category.name}`)
      
      const templates: CategoryTemplate[] = category.customization_templates || []
      
      for (const template of templates) {
        // Check if similar customization already exists
        const { data: existing } = await supabase
          .from('global_customizations')
          .select('id')
          .eq('restaurant_id', category.restaurant_id)
          .eq('name', template.name)
          .eq('type', template.type)
          .single()

        if (existing) {
          console.log(`     ⏭️  Skipped duplicate: "${template.name}" (${template.type})`)
          templateToGlobalIdMap.set(`${category.id}-${template.id}`, existing.id)
          skippedCount++
          continue
        }

        // Insert as global customization
        const { data: newCustomization, error: insertError } = await supabase
          .from('global_customizations')
          .insert({
            restaurant_id: category.restaurant_id,
            name: template.name,
            type: template.type,
            default_price: template.default_price || 0,
            is_required: template.is_required || false,
            max_selections: template.max_selections || 1,
            is_active: true
          })
          .select()
          .single()

        if (insertError) {
          console.error(`     ❌ Error inserting "${template.name}":`, insertError)
          continue
        }

        templateToGlobalIdMap.set(`${category.id}-${template.id}`, newCustomization.id)
        console.log(`     ✅ Migrated: "${template.name}" → ID: ${newCustomization.id}`)
        migratedCount++
      }
    }

    console.log(`\n   Summary: ${migratedCount} migrated, ${skippedCount} skipped\n`)

    // Step 3: Link menu items to global customizations
    console.log('🔗 Step 3: Linking menu items to global customizations...')
    
    // Fetch all menu items
    const { data: menuItems, error: itemsError } = await supabase
      .from('menu_items')
      .select('*')

    if (itemsError) {
      console.error('❌ Error fetching menu items:', itemsError)
      return
    }

    if (!menuItems || menuItems.length === 0) {
      console.log('✅ No menu items found. Skipping linking step.')
      return
    }

    let linkCount = 0
    let legacyMigrationCount = 0

    for (const item of menuItems) {
      // Get the category's templates
      const category = categories.find(c => c.id === item.category_id)
      if (!category) continue

      const templates = category.customization_templates || []
      if (templates.length === 0) continue

      console.log(`   Processing menu item: ${item.name}`)

      // For each template in the category, create a link
      for (const template of templates) {
        const globalId = templateToGlobalIdMap.get(`${category.id}-${template.id}`)
        if (!globalId) continue

        // Check if link already exists
        const { data: existingLink } = await supabase
          .from('menu_item_customizations')
          .select('id')
          .eq('menu_item_id', item.id)
          .eq('customization_id', globalId)
          .single()

        if (existingLink) {
          console.log(`     ⏭️  Link already exists for "${template.name}"`)
          continue
        }

        // Create link
        const { error: linkError } = await supabase
          .from('menu_item_customizations')
          .insert({
            menu_item_id: item.id,
            customization_id: globalId,
            is_enabled: true,
            sort_order: 0
          })

        if (linkError) {
          console.error(`     ❌ Error linking "${template.name}":`, linkError)
          continue
        }

        console.log(`     🔗 Linked: "${template.name}"`)
        linkCount++
      }

      // Also migrate legacy customization_config if it exists
      if (item.customization_config && item.customization_config.length > 0) {
        console.log(`     📦 Migrating legacy customization_config...`)
        
        for (const legacyOption of item.customization_config) {
          // Check if global customization exists
          const { data: existingGlobal } = await supabase
            .from('global_customizations')
            .select('id')
            .eq('restaurant_id', item.restaurant_id)
            .eq('name', legacyOption.name)
            .eq('type', legacyOption.type)
            .single()

          let globalId: string

          if (existingGlobal) {
            globalId = existingGlobal.id
          } else {
            // Create new global customization
            const { data: newGlobal, error: createError } = await supabase
              .from('global_customizations')
              .insert({
                restaurant_id: item.restaurant_id,
                name: legacyOption.name,
                type: legacyOption.type,
                default_price: legacyOption.default_price || 0,
                is_required: legacyOption.is_required || false,
                max_selections: legacyOption.max_selections || 1,
                is_active: true
              })
              .select()
              .single()

            if (createError) {
              console.error(`       ❌ Error creating global customization:`, createError)
              continue
            }

            globalId = newGlobal.id
            console.log(`       ✅ Created global: "${legacyOption.name}"`)
          }

          // Create link
          const { error: linkError } = await supabase
            .from('menu_item_customizations')
            .insert({
              menu_item_id: item.id,
              customization_id: globalId,
              is_enabled: true,
              sort_order: 0
            })

          if (linkError) {
            console.error(`       ❌ Error linking:`, linkError)
            continue
          }

          legacyMigrationCount++
        }
      }
    }

    console.log(`\n   Summary: ${linkCount} category links created, ${legacyMigrationCount} legacy options migrated\n`)

    // Step 4: Generate report
    console.log('📊 Migration Report:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Categories processed:     ${categories.length}`)
    console.log(`Templates migrated:       ${migratedCount}`)
    console.log(`Duplicates skipped:       ${skippedCount}`)
    console.log(`Menu item links created:  ${linkCount}`)
    console.log(`Legacy options migrated:  ${legacyMigrationCount}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✅ Migration completed successfully!')
    console.log('\n⚠️  Note: Old columns (categories.customization_templates, menu_items.customization_config)')
    console.log('   are still present for backward compatibility. They can be removed after validation.\n')

  } catch (error) {
    console.error('\n❌ Migration failed with error:', error)
    process.exit(1)
  }
}

// Run migration
migrateCustomizations()
