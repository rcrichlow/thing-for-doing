export default function getErrorMessage(error) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong';
}
