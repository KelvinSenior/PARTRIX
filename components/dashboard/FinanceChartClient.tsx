"use client";

import dynamic from "next/dynamic";
import type { FC } from "react";

const FinanceChart = dynamic(() => import("./FinanceChart"), { ssr: false });

const FinanceChartClient: FC<{ monthly: Array<{ month: string; revenue: number; expenses: number; profit: number }> }> = ({ monthly }) => {
  return <FinanceChart monthly={monthly} />;
};

export default FinanceChartClient;
