import { PropsWithChildren } from "react";

type TableProps = {
  headers: string[];
  alignLastLeft?: boolean;
};

export const Table = ({ headers, alignLastLeft = false, children }: PropsWithChildren<TableProps>) => (
  <table className="w-full text-xs md:text-sm border border-body">
    <thead>
      <tr className="text-gray-400 uppercase tracking-wider text-[10px] md:text-xs">
        {headers.map((header, index) => {
          const align = index === headers.length - 1 && !alignLastLeft ? " text-right" : "";
          return (
            <th key={header} className={"text-left py-3 px-3 md:px-4 font-medium whitespace-nowrap sticky bg-body" + align}>
              {header}
            </th>
          );
        })}
      </tr>
    </thead>
    <tbody>{children}</tbody>
  </table>
);
