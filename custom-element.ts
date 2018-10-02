export const CustomElement = (args: any) => {
  return (target: any) => {
    console.log(args.tag);
    return target;
  };
};