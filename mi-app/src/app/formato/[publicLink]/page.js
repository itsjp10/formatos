import FormatoPublicoClient from './FormatoPublicoClient'

export default async function Page({ params }) {
  return <FormatoPublicoClient publicLink={await params.publicLink} />
}
