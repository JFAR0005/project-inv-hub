
import React from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/context/AuthContext";

export interface Company {
  id: string;
  name: string;
  logo: string;
  sector: string;
  stage: string;
  metrics: {
    mrr: number;
    arr: number;
    growth: number;
    runway: number;
  };
  lastUpdate: string;
}

interface PortfolioCardProps {
  company: Company;
}

export function PortfolioCard({ company }: PortfolioCardProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const isFounder = user?.role === "founder" && user.companyId === company.id;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      notation: "compact",
      maximumFractionDigits: 1,
    }).format(value);
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            {company.logo ? (
              <img
                src={company.logo}
                alt={`${company.name} logo`}
                className="w-8 h-8 object-contain rounded"
              />
            ) : (
              <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                <span className="text-primary font-bold text-sm">
                  {company.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-0.5">
                <Badge variant="outline">{company.sector}</Badge>
                <Badge variant="secondary">{company.stage}</Badge>
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
          {(isAdmin || isFounder) && (
            <>
              <div>
                <p className="text-xs text-muted-foreground">MRR</p>
                <p className="font-medium">{formatCurrency(company.metrics.mrr)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ARR</p>
                <p className="font-medium">{formatCurrency(company.metrics.arr)}</p>
              </div>
            </>
          )}
          <div className="col-span-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Growth</span>
              <span>{company.metrics.growth}%</span>
            </div>
            <Progress value={company.metrics.growth} className="h-1" />
          </div>
          {isAdmin && (
            <div className="col-span-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">Runway</span>
                <span>{company.metrics.runway} months</span>
              </div>
              <Progress
                value={(company.metrics.runway / 18) * 100}
                className={`h-1 ${
                  company.metrics.runway < 6
                    ? "bg-destructive"
                    : company.metrics.runway < 12
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
              />
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="w-full flex justify-between items-center">
          <p className="text-xs text-muted-foreground">
            Updated {company.lastUpdate}
          </p>
          <Link
            to={`/portfolio/${company.id}`}
            className="text-xs text-primary hover:underline font-medium"
          >
            View Details →
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default PortfolioCard;
