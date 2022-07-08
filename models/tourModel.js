const mongoose = require('mongoose');
const slugify = require('slugify');
//const validator = require('validator');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name specified'],
      unique: true,
      trim: true,
      maxlength: [40, 'A tour name must be at least 40 characters'],
      minlength: [10, 'A tour name must be at least 10 characters'],
      //validate: [validator.isAlpha, 'Tour name must only contain caracters'],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration specified'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size specified'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty specified'],
      enum: {
        values: ['easy', 'medium', 'difficulty'],
        message: 'Difficulty is either: easy, medium, or difficulty',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price specified'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // esse validador só vale para documentos criados
          return val < this.price;
        },
        message: 'Discount price ({VALUE}) should be below regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a description specified'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image specified'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

// DOCUMTN MIDDLEWARE: runs before .save() and .create()
// esse validador só vale para documentos criados
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.pre('save', (next) => {
//   console.log('Will save document...');
//   next();
// });

// tourSchema.post('save', (doc, next) => {
//   console.log(doc);
//   next();
// });

// QUERY MIDDLEWARE
//tourSchema.pre('find', function (next) {
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });

  this.start = Date.now();
  next();
});

// eslint-disable-next-line prefer-arrow-callback
tourSchema.post('find', function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} miliseconds`);
  next();
});

// AGGREGATION MIDDLEWARE
// eslint-disable-next-line prefer-arrow-callback
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  console.log(this.pipeline());
  next();
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
