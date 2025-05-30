// Generated by https://quicktype.io

export interface ModelsFile {
  updatedAt: number;
  rows: Row[];
  blacklist: string[];
}

export interface Row {
  id: string;
  manufacturer?: string;
  name: string;
  manufacturers?: string[];
  description?: string;
  landingGear?: LandingGear;
  wingPos?: WingPos;
  wingShape?: WingShape;
  type: Type;
  engNum?: number;
  engType: EngType;
  wtc?: Wtc;
  rareness: number;
  num: number;
  xp: number;
  firstFlight?: number;
  wingspan?: number;
  length?: number;
  height?: number;
  ceiling?: number;
  mtow?: number;
  seats?: number;
  range?: number;
  maxSpeed?: number;
  cardCategory: CardCategory;
  rotorConfig?: RotorConfig;
  images?: string[];
  markers?: string[];
}

export enum CardCategory {
  Common = "common",
  Fantasy = "fantasy",
  Historical = "historical",
  Rare = "rare",
  Scarce = "scarce",
  Ultra = "ultra",
  Uncommon = "uncommon",
}

export enum EngType {
  E = "E",
  Empty = "_",
  J = "J",
  P = "P",
  R = "R",
  T = "T",
}

export enum LandingGear {
  Amphibian = "Amphibian",
  Floaters = "Floaters",
  Monowheel = "Monowheel",
  Quadricycle = "Quadricycle",
  ReverseTricycle = "Reverse tricycle",
  Skids = "Skids",
  SkidsOrTricycle = "Skids or tricycle",
  Tailwheel = "Tailwheel",
  TailwheelOrFloaters = "Tailwheel or floaters",
  Tricycle = "Tricycle",
  TricycleOrFloaters = "Tricycle or floaters",
}

export enum RotorConfig {
  Coaxial = "Coaxial",
  CoaxialPusher = "Coaxial+Pusher",
  Gyrocopter = "Gyrocopter",
  Intermeshing = "Intermeshing",
  MainFenestron = "Main+Fenestron",
  MainNOTAR = "Main+NOTAR",
  MainTail = "Main+Tail",
  Tandem = "Tandem",
  Transverse = "Transverse",
}

export enum Type {
  A = "A",
  Empty = "_",
  G = "G",
  H = "H",
  L = "L",
  T = "T",
}

export enum WingPos {
  Biplane = "Biplane",
  HighWing = "High wing",
  LowWing = "Low wing",
  MidWing = "Mid wing",
  ParasolWing = "Parasol wing",
  ShoulderAndLow = "Shoulder and low",
  ShoulderWing = "Shoulder wing",
}

export enum WingShape {
  Delta = "Delta",
  DeltaWithCanardFrontWing = "Delta with canard front wing",
  Kite = "Kite",
  MonoplaneWithEqualSpanForeplane = "monoplane with equal-span foreplane",
  Rectangular = "Rectangular",
  RectangularSweptBack = "Rectangular swept back",
  RectangularSweptForward = "Rectangular swept forward",
  RectangularWithCanardFrontWing = "Rectangular with canard front wing",
  ReverseTaper = "Reverse taper",
  Rounded = "Rounded",
  RoundedRear = "Rounded rear",
  Sailplane = "Sailplane",
  SweptBack = "Swept back",
  SweptBackCanard = "Swept back + Canard",
  SweptBackSlightly = "Swept back slightly",
  SweptForwardSlightly = "Swept forward slightly",
  Swing = "Swing",
  Tapered = "Tapered",
  TaperedFront = "Tapered front",
  TaperedOuter = "Tapered outer",
  TaperedRear = "Tapered rear",
  TaperedSweptForward = "Tapered swept forward",
  TaperedWithCanardFrontWing = "Tapered with canard front wing",
}

export enum Wtc {
  H = "H",
  L = "L",
  LM = "L/M",
  M = "M",
  S = "S",
}
