import { FaLinkedinIn, FaGithub, FaInstagram, FaWhatsapp } from 'react-icons/fa6'

const ICONS = {
  linkedin: [FaLinkedinIn, 'LinkedIn'],
  github: [FaGithub, 'GitHub'],
  instagram: [FaInstagram, 'Instagram'],
  whatsapp: [FaWhatsapp, 'WhatsApp'],
}

/** Round icon links. Any link that is an empty string is simply not shown. */
export default function Socials({ links = {}, label = '', size = 'md', className = '' }) {
  const dim = size === 'lg' ? 'h-11 w-11 text-base' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm'
  const entries = Object.keys(ICONS).filter((k) => links[k])
  if (!entries.length) return null
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {entries.map((k) => {
        const [Icon, name] = ICONS[k]
        return (
          <a
            key={k}
            href={links[k]}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label ? `${label} on ${name}` : name}
            className={`grid ${dim} place-items-center rounded-full border border-white/15 bg-white/5 text-white/80 backdrop-blur transition-colors duration-300 hover:border-aws hover:bg-aws hover:text-white`}
          >
            <Icon />
          </a>
        )
      })}
    </div>
  )
}
