export const qs = (doc = null) => {
  const _doc = doc ?? window.document
  return (sel, el = _doc) => el.querySelector(sel)
}
export const qsa = (doc = null) => {
  const _doc = doc ?? window.document
  return (sel, el = _doc) => [...el.querySelectorAll(sel)]
}

// this tests an entity to see if it's a plain old object
export const isAttrs = arg =>
  typeof arg === 'object' && arg !== null &&
  !Array.isArray(arg) && !(arg instanceof window.Node)

const throwError = msg => {
  throw Error(msg)
}

const parseKid = kid =>
  (kid instanceof window.Node)
    ? [kid]
    : Array.isArray(kid)
      ? parseKids(...kid)
      : typeof kid === 'string'
        ? [document.createTextNode(kid)]
        : typeof kid === 'number'
          ? [document.createTextNode(kid + '')]
          : throwError('unrecognized child node')

const parseKids = (...kids) => kids.flatMap(parseKid)

const parseElemArgs = (...args) =>
  args.length === 0
    ? [{}, []]
    : isAttrs(args[0])
      ? [args[0], parseKids(...args.slice(1))]
      : [{}, parseKids(...args)]

export const setAttrs = (elem, attrs={}) => {
  Object.entries(attrs).forEach(([name, value]) => {
    elem.setAttribute(name, value)
  })
}
export const addKids = (elem, ...kids) => {
  kids.forEach(kid => {
    elem.appendChild(kid)
  })
}

const _Element = create => tag => (...args) => {
  const elem = create(tag)
  const [attrs, kids] = parseElemArgs(...args)
  setAttrs(elem, attrs)
  addKids(elem, ...kids)
  return elem
}

export const Element = _Element(tag => document.createElement(tag))
export const SvgElement = _Element(
  tag => document.createElementNS('http://www.w3.org/2000/svg', tag)
)

export const HTML = Object.fromEntries(
  ('canvas div fieldset form h1 h2 h3 h4 h5 h6 h7 img input label legend ' +
    'table tbody td th thead tr')
    .split(' ')
    .map(name => [name, Element(name)])
)
export const SVG = Object.fromEntries(
  'circle clipPath defs feDropShadow filter g image path rect svg text use'
    .split(' ')
    .map(name => [name, SvgElement(name)])
)
