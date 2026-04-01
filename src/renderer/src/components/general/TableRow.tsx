export const TableRow = ({ children, noHoverEffect }: { children: any; noHoverEffect?: boolean }) => (
  <tr className={"border-t border-body content-center" + (noHoverEffect ? "" : " hover:bg-surface-hover transition")}>
    {children}
  </tr>
);
