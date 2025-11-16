function Error({ statusCode }: { statusCode: number }) {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>{statusCode ? `Error ${statusCode}` : 'An error occurred'}</h1>
      <p>
        {statusCode === 404
          ? 'Page not found'
          : 'An unexpected error has occurred'}
      </p>
      <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
        Go back home
      </a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: any) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
