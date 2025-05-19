export default function CustomError({ statusCode }) {
  return (
    <div>
      <h1>Error {statusCode}</h1>
      <p>
        {statusCode
          ? `An error ${statusCode} occurred on server`
          : 'An error occurred on client'}
      </p>
    </div>
  )
}

export async function getServerSideProps(context) {
  const { res, err } = context
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  
  return {
    props: { statusCode }
  }
}
