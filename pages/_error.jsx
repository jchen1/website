import Error from "next/error";

function CustomError({ statusCode }) {
  return <Error statusCode={statusCode}></Error>;
}

CustomError.getInitialProps = ({ asPath, res, err }) => {
  if (asPath.endsWith("/")) {
    res.writeHead(302, { Location: asPath.substring(0, asPath.length - 1) });
    return res.end();
  }

  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default CustomError;
