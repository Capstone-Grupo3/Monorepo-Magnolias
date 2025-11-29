import React, { ReactNode } from "react";

interface CardDataStatsProps {
  title: string;
  total: string;
  rate?: string;
  levelUp?: boolean;
  levelDown?: boolean;
  children: ReactNode;
}

const CardDataStats: React.FC<CardDataStatsProps> = ({
  title,
  total,
  rate,
  levelUp,
  levelDown,
  children,
}) => {
  return (
    <div className="rounded-sm border border-gray-200 bg-white py-6 px-7.5 shadow-default dark:border-gray-700 dark:bg-gray-800">
      <div className="flex h-11.5 w-11.5 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
        {children}
      </div>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            {total}
          </h4>
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</span>
        </div>

        {rate && (
          <span
            className={`flex items-center gap-1 text-sm font-medium ${
              levelUp && "text-meta-3"
            } ${levelDown && "text-meta-5"} `}
          >
            {rate}

            {levelUp && (
              <svg
                className="fill-meta-3"
                width="10"
                height="11"
                viewBox="0 0 10 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.35716 2.47737L0.908974 5.82987L5.0443e-07 4.94612L5 0.0848689L10 4.94612L9.09103 5.82987L5.64284 2.47737L5.64284 10.0849L4.35716 10.0849L4.35716 2.47737Z"
                  fill=""
                />
              </svg>
            )}

            {levelDown && (
              <svg
                className="fill-meta-5"
                width="10"
                height="11"
                viewBox="0 0 10 11"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.64284 8.53663L9.09103 5.18413L10 6.06788L5 10.9291L-8.98482e-07 6.06788L0.908973 5.18413L4.35716 8.53663L4.35716 0.929139L5.64284 0.929139L5.64284 8.53663Z"
                  fill=""
                />
              </svg>
            )}
          </span>
        )}
      </div>
    </div>
  );
};

export default CardDataStats;
