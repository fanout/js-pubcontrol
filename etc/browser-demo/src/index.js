import PubControl from "pubcontrol"

const readiness = (document) => {
  if (document.readyState === "loading") {  // Loading hasn't finished yet
    return new Promise((resolve, reject) => document.addEventListener("DOMContentLoaded", resolve))
  }
}

const schema = (obj) => {
  const props = Object.entries(obj)
  .reduce((reduced, [key, val]) => Object.assign(reduced, { [key]: typeof val }), {})
  console.debug('schema out', props)
  return props
}

const render = (document) => {
  console.debug("rendering")
  document.querySelectorAll('.replace-with-pubcontrol').forEach(el => {
    el.innerHTML = `
    <div>
      <h2>pubcontrol default export</h2>
      <pre>${JSON.stringify(schema(PubControl), null, 2)}</pre>
    </div>
    `
  })
}

const main = async () => {
  console.log("node-pubcontrol", PubControl)
  await readiness(document)
  render(document)
}

if (typeof document !== 'undefined') {
  main(document)
  .catch(error => { console.error(error); throw error })
} else {
  throw new Error('pubcontrol browser-demo must be run with a global document')
}