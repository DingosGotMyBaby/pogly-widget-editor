export const TableCell = ({ className, children }: any) => (
  <td className={`relative content-center py-3 px-3 md:px-4 text-gray-300 align-top whitespace-nowrap ${className ?? ""}`}>
    {children}
  </td>
);
