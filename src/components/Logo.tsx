import { logo } from '../data/media'
import { Picture } from './Picture'

export function Logo({ className, sizes }: { className?: string; sizes: string }) {
  return <Picture photo={logo} className={className} sizes={sizes} />
}
