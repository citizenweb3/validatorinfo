import env from 'core/env'
import _ from 'lodash'


// Handles translating @/assets/**/<img_path> to /assets/**/<img_path> on production or to /src/** on development
// Used for dynamic string usage of asset urls in components or from store
export default function (assetUrl: string) {
  let isProd = env("MODE") === 'production'
  return isProd ? `/assets/${_.last(assetUrl.split('/'))}` : new URL(assetUrl.replace('@/','/src/'), import.meta.url).href;
}
