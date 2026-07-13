import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'

// If sanity.config.ts is in the root, remove 'src/' from the start of the path
import { schema } from './src/sanity/schemaTypes' 

export default defineConfig({
  name: 'default',
  title: 'GreyMatter Journal',
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,
  basePath: '/studio',
  plugins: [structureTool(), visionTool()],
  schema: schema,
})