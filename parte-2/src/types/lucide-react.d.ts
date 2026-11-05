declare module "lucide-react" {
  import * as React from "react";
  export interface LucideProps extends React.SVGProps<SVGSVGElement> {
    size?: string | number;
    color?: string;
    strokeWidth?: string | number;
  }
  export type Icon = React.FC<LucideProps>;
  export const Plus: Icon;
  export const ListTodo: Icon;
  export const Loader2: Icon;
  export const Trash2: Icon;
  export const Edit3: Icon;
  export const Calendar: Icon;
  export const Sparkles: Icon;
  export const RefreshCw: Icon;
  export const CheckSquare: Icon;
  export const CheckCircle2: Icon;
  export const AlertCircle: Icon;
  export const X: Icon;
  export const ArrowLeft: Icon;
  export const Save: Icon;
}

