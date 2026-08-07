import type { NextPageContext } from "next";

const statusCodes: Record<number, string> = {
  400: "Bad Request",
  404: "Page not found",
  405: "Method Not Allowed",
  500: "Internal Server Error",
};

interface CustomErrorProps {
  statusCode: number;
}

function CustomError({ statusCode }: CustomErrorProps) {
  const msg = `${statusCode}: ${statusCodes[statusCode] || ""}.`;
  return (
    <h1 className="title">
      {statusCode
        ? msg
        : "An unexpected error occurred. Please refresh and try again."}
    </h1>
  );
}

CustomError.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode! : 404;
  return { statusCode };
};

export default CustomError;
