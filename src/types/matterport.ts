export interface TagData {
  label: string;
  description: string;
  anchorPosition: { x: number; y: number; z: number };
  stemVector: { x: number; y: number; z: number };
  color: { r: number; g: number; b: number };
}

export interface Tag {
  id: string;
  label: string;
  description: string;
  anchorPosition: { x: number; y: number; z: number };
  stemVector: { x: number; y: number; z: number };
  color: { r: number; g: number; b: number };
}

export interface MatterportSDK {
  Tag: {
    add: (params: TagData) => Promise<string[]>;
    list: () => Promise<Tag[]>;
    delete: (tagId: string) => Promise<void>;
    open: (tagId: string, options?: TagOpenOptions) => Promise<void>;
    allowAction: (tagId: string, action: string) => Promise<void>;
    attach: (tagId: string, attachment: Attachment) => Promise<void>;
    detach: (tagId: string, attachmentId: string) => Promise<void>;
    editPosition: (tagId: string, descriptor: EditPositionDescriptor) => Promise<void>;
    editStemHeight: (tagId: string, options: StemHeightEditOptions) => Promise<void>;
    getAttachment: (tagId: string, attachmentId: string) => Promise<Attachment>;
    getAttachments: (tagId: string) => Promise<Attachment[]>;
    getData: (tagId: string) => Promise<Tag>;
    setData: (tagId: string, data: Partial<TagData>) => Promise<void>;
    setColor: (tagId: string, color: { r: number; g: number; b: number }) => Promise<void>;
    setLabel: (tagId: string, label: string) => Promise<void>;
    setDescription: (tagId: string, description: string) => Promise<void>;
    setAnchorPosition: (tagId: string, position: { x: number; y: number; z: number }) => Promise<void>;
    setStemVector: (tagId: string, vector: { x: number; y: number; z: number }) => Promise<void>;
    openTags: OpenTags;
  };
  Camera: {
    moveTo: (params: CameraMoveToParams) => Promise<void>;
    lookAt: (params: CameraLookAtParams) => Promise<void>;
    getPose: () => Promise<CameraPose>;
  };
  Scene: {
    getData: () => Promise<SceneData>;
  };
  Graph: {
    createGraph: () => Promise<IDirectedGraph>;
    createSweepGraph: () => Promise<IDirectedGraph>;
    createDirectedGraph: () => Promise<IDirectedGraph>;
    createAStarRunner: (graph: IDirectedGraph, start: Vertex, end: Vertex) => IAStarRunner;
    AStarRunner: new (graph: IDirectedGraph, start: Vertex, end: Vertex) => IAStarRunner;
    AStarStatus: {
      SUCCESS: string;
      RUNNING: string;
      FAILED: string;
    };
  };
  Sweep: {
    data: Record<string, SweepData>;
    moveTo: (sweepId: string, options: TransitionOptions) => Promise<void>;
    current: {
      get: () => Promise<string>;
    };
    createGraph: () => Promise<IDirectedGraph>;
    getData: () => Promise<Record<string, SweepData>>;
  };
  App: {
    state: {
      waitUntil: (state: string) => Promise<void>;
    };
    State: {
      PLAYING: string;
    };
    getState: () => any;
  };
}

export interface CameraPose {
  position: Vector3;
  target: Vector3;
  up: Vector3;
}

export interface CameraMoveToParams {
  position: Vector3;
  transition?: {
    duration: number;
    easing: string;
  };
}

export interface CameraLookAtParams {
  position: Vector3;
  target: Vector3;
  transition?: {
    duration: number;
    easing: string;
  };
}

export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

export interface IDirectedGraph {
  vertex: (id: string) => Vertex | null;
  dispose: () => void;
}

export interface IAStarRunner {
  exec: () => {
    status: string;
    path: Vertex[];
  };
}

export interface Vertex {
  id: string;
  data: any;
}

export interface Attachment {
  id: string;
  type: string;
  data: any;
}

export interface EditPositionDescriptor {
  position: Vector3;
  stemVector: Vector3;
}

export interface StemHeightEditOptions {
  height: number;
}

export interface TransitionOptions {
  transition: {
    duration: number;
    easing: string;
  };
}

export interface OpenOptions {
  transition?: TransitionOptions;
}

export interface OpenTags {
  open: (tagId: string, options?: OpenOptions) => Promise<void>;
  close: () => Promise<void>;
}

export interface SceneData {
  sweep: string;
  mode: string;
  [key: string]: any;
}

export interface SweepData {
  position: Vector3;
  [key: string]: any;
}

export interface TagOpenOptions {
  transition?: {
    duration: number;
    easing: string;
  };
  allowAction?: boolean;
  openTags?: {
    open: boolean;
    close: boolean;
  };
} 