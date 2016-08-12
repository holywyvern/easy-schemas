"use strict";
let chai   = require('chai');

let Schema = require('../index');

const expect = chai.expect;

let pointSchema    = new Schema({ x: Number, y: Number });
let requiredSchema = new Schema({ field: { type: String, required: true }});
let nestedSchema   = new Schema({ point: pointSchema });
let minMaxSchema   = new Schema({ score: { type: Number, min: 0, max: 10 }})
let lengthSchema   = new Schema({ name: { type: String, min: 1, max: 10 }})
let arraySchema    = new Schema({ items: { type: [Number], min: 1, max: 5 }});
let patternSchema  = new Schema({ name: { type: String, pattern: /^[a-z]+$/ }});
let functionSchema = new Schema({ item: { type: Number, validator: function (n) { return n == 3; } } });

describe('Test Point Schema', function () {
  describe("Test non null parameters", function() {
    it("Ensures point validates with numeric fields", function() {
      let point = { x: 2, y: 3 };
      let validation = pointSchema.validate(point);
      expect(validation.valid).to.equal(true);
    });
  });
  describe("Test null parameters", function() {
    it("Ensures point validates with null fields", function() {
      let point = { x: null, y: 3 };
      let validation = pointSchema.validate(point);
      expect(validation.valid).to.equal(true);
    });
  });  
  describe("Test invalid types", function() {
    it("Ensures point invalidates with invalid types", function() {
      let point = { x: "invalid", y: 3 };
      let validation = pointSchema.validate(point);
      expect(validation.valid).to.equal(false);
    });
  });   
  describe("Test Missing fields", function() {
    it("Ensures point invalidates with missing fields", function() {
      let point = { y: 3 };
      let validation = pointSchema.validate(point);
      expect(validation.valid).to.equal(false);
    });
  });      
});

describe('Test Required Schema', function () {
  describe("Test non null parameters", function() {
    it("Ensures required field is processed", function() {
      let item = { field: 'Hello' };
      let validation = requiredSchema.validate(item);
      expect(validation.valid).to.equal(true);      
    });
  });
  describe("Test missing parameters", function() {
    it("Ensures required field is invalidated when missing", function() {
      let item = {};
      let validation = requiredSchema.validate(item);
      expect(validation.valid).to.equal(false);      
    });
  });  
  describe("Test null parameters", function() {
    it("Ensures required field is invalidated when is null", function() {
      let item = { field: null };
      let validation = requiredSchema.validate(item);
      expect(validation.valid).to.equal(false);      
    });
  });    
  describe("Test invalid type parameters", function() {
    it("Ensures required field is invalidated when type is not correct", function() {
      let item = { field: 2 };
      let validation = requiredSchema.validate(item);
      expect(validation.valid).to.equal(false);      
    });
  });    
});

describe('Test Nested Schema', function () {
  it("Ensures nested schemas work", function() {
      let item = { point: { x: 1, y: 2 } };
      let validation = nestedSchema.validate(item);
      expect(validation.valid).to.equal(true);    
  });
});

describe('Test Size Attributes', function () {
  describe('Test min and max Attributes on Numbers', function () {
    it("Ensures min attribute works", function() {
        let item = { score: -1 };
        let validation = minMaxSchema.validate(item);
        expect(validation.valid).to.equal(false);    
    });
    it("Ensures max attribute works", function() {
        let item = { score: 11 };
        let validation = minMaxSchema.validate(item);
        expect(validation.valid).to.equal(false);    
    });    
    it("Ensures min and max attributes work together", function() {
        let item = { score: 5 };
        let validation = minMaxSchema.validate(item);
        expect(validation.valid).to.equal(true);    
    });      
  });
  describe('Test min and max Attribute on Strings', function () {
    it("Ensures min attribute works", function() {
        let item = { name: "" };
        let validation = lengthSchema.validate(item);
        expect(validation.valid).to.equal(false);    
    });
    it("Ensures max attribute works", function() {
        let item = { name: "Ramiro Rojo" };
        let validation = lengthSchema.validate(item);
        expect(validation.valid).to.equal(false);    
    });    
    it("Ensures min and max attributes work together", function() {
        let item = { name: "Ramiro" };
        let validation = lengthSchema.validate(item);
        expect(validation.valid).to.equal(true);    
    });      
  });  
  describe('Test Patter attribute', function () {
    it("Ensures pattern attribute works", function() {
        let validation = patternSchema.validate({ name: "Ramiro" });
        expect(validation.valid).to.equal(false);      
        validation = patternSchema.validate({ name: "ramiro" });
        expect(validation.valid).to.equal(true);            
    });
  });
});

describe('Test Array Attributes', function () {
  describe('Test valid item array', function () {
    it("Check than array checks type", function() {
        let item = { items: [1, 2, 3] };
        let validation = arraySchema.validate(item);
        expect(validation.valid).to.equal(true); 
    });    
  });
  describe('Test null item array', function () {
    it("Check null array", function() {
        let item = { items: null };
        let validation = arraySchema.validate(item);
        expect(validation.valid).to.equal(true); 
    });    
  });  
  describe('Test valid array size', function () {
    it("Check than array is between min and max", function() {
        let validation = arraySchema.validate({ items: [] });
        expect(validation.valid).to.equal(false); 
        validation = arraySchema.validate({ items: [1,1,5,5,5,5] });
        expect(validation.valid).to.equal(false); 
    });    
  });  
  describe('Test invalid item array', function () {
    it("Check than array checks type", function() {
        let item = { items: [1, "invalid", 3] };
        let validation = arraySchema.validate(item);
        expect(validation.valid).to.equal(false); 
    });    
  });  
});

describe('Test validator function ', function () {
  describe('Test valid value', function () {
    it("Checks than value is evaluted to true", function() {
        let item = { item: 3 };
        let validation = functionSchema.validate(item);
        expect(validation.valid).to.equal(true); 
    });    
  });  
  describe('Test invalid value', function () {
    it("Checks than value is evaluted to true", function() {
        let validation = functionSchema.validate({ item: 4 });
        expect(validation.valid).to.equal(false); 
        validation = functionSchema.validate({ item: 'a' });
        expect(validation.valid).to.equal(false); 
    });    
  });    
});