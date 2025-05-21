export type PhysicsExperiment = {
  id: string;
  title: string;
  description: string;
  type:
    | "projectile"
    | "pendulum"
    | "svganimation"
    | "newton"
    | "freefall"
    | "wave"
    | "circular-motion"
    | "circuit";
  svgPath?: string;
  params: {
    [key: string]: {
      name: string;
      min: number;
      max: number;
      default: number;
      step: number;
      unit: string;
    };
  };
};
