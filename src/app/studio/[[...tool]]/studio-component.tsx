'use client';

import { NextStudio } from 'next-sanity/studio';
// Navigate up four levels to reach the root folder
import config from '../../../../sanity.config'; 

export default function StudioComponent() {
  return <NextStudio config={config} />;
}