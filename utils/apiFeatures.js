class APIFeatures {
    constructor(query, querystr) {
      this.query = query;
      this.querystr = querystr;
    }
  
    filter() {
      let queryObj = { ...this.querystr };
      const excludeFields = ['page', 'sort', 'limit', 'fields'];
      excludeFields.forEach((el) => delete queryObj[el]);
  
      queryObj = JSON.stringify(queryObj);
      
      queryObj = queryObj.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  
      this.query = this.query.find(JSON.parse(queryObj));
  
      return this;
    }
  
    sort() {
      if (this.querystr.sort) {
        const sortBy = this.querystr.sort.split(',').join(' ');
        this.query = this.query.sort(sortBy);
      } else {
        this.query = this.query.sort('-createdAt');
      }
  
      return this;
    }
  
    limitingFields() {
      if (this.querystr.fields) {
        const fields = this.querystr.fields.split(',').join(' ');
        this.query = this.query.select(fields);
      } else {
        this.query = this.query.select('-__v');
      }
  
      return this;
    }
  
    paginate() {
      const page = this.querystr.page * 1 || 1;
      const limit = this.querystr.limit * 1 || 100;
      const skip = (page - 1) * limit;
  
      this.query = this.query.skip(skip).limit(limit);
  
      return this;
    }
  }

  module.exports = APIFeatures;