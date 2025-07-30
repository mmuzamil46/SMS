import mongoose, { Document, Schema, Model } from "mongoose";

export interface IModule extends Document {
  course: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  lessons: mongoose.Types.ObjectId[];
  order: number;
  isLocked: boolean;
  unlockCondition: string;
  releaseDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ModuleSchema: Schema<IModule> = new Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      default: ""
    },
    lessons: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lesson"
      }
    ],
    order: {
      type: Number,
      required: true
    },
    isLocked: {
      type: Boolean,
      default: false
    },
    unlockCondition: {
      type: String,
      default: "none"
    },
    releaseDate: {
      type: Date
    },
    createdAt: {
      type: Date,
      default: () => new Date()
    },
    updatedAt: {
      type: Date,
      default: () => new Date()
    }
  }
);

ModuleSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const ModuleModel: Model<IModule> = mongoose.model<IModule>("Module", ModuleSchema);

export default ModuleModel;
