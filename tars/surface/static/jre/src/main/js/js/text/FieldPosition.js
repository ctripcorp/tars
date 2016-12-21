/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2014年10月16日
 */

Class
  .forName({
    name: "public class js.text.FieldPosition",

    /**
     * Input: Desired field to determine start and end offsets for. The
     * meaning depends on the subclass of Format.
     */
    "int field": 0,

    /**
     * Output: End offset of field in text. If the field does not occur
     * in the text, 0 is returned.
     */
    "int endIndex": 0,

    /**
     * Output: Start offset of field in text. If the field does not
     * occur in the text, 0 is returned.
     */
    "int beginIndex": 0,

    /**
     * Creates a FieldPosition object for the given field. Fields are
     * identified by constants, whose names typically end with _FIELD,
     * in the various subclasses of Format.
     *
     * @see java.text.NumberFormat#INTEGER_FIELD
     * @see java.text.NumberFormat#FRACTION_FIELD
     * @see java.text.DateFormat#YEAR_FIELD
     * @see java.text.DateFormat#MONTH_FIELD
     */
    "public FieldPosition": function(field, beginIndex, endIndex) {
      this.field = field;
      this.beginIndex = beginIndex;
      this.endIndex = endIndex;
    },

    /**
     * Retrieves the field identifier.
     */
    "public int getField": function() {
      return this.field;
    },

    /**
     * Retrieves the index of the first character in the requested
     * field.
     */
    "public int getBeginIndex": function() {
      return this.beginIndex;
    },

    /**
     * Retrieves the index of the character following the last character
     * in the requested field.
     */
    "public int getEndIndex": function() {
      return this.endIndex;
    },

    /**
     * Sets the begin index. For use by subclasses of Format.
     *
     * @since 1.2
     */
    "public void setBeginIndex": function(bi) {
      this.beginIndex = bi;
    },

    /**
     * Sets the end index. For use by subclasses of Format.
     *
     * @since 1.2
     */
    "public void setEndIndex": function(ei) {
      this.endIndex = ei;
    },

    /**
     * Overrides equals
     */
    "public boolean equals": function(obj) {
      if (Object.isNull(obj))
        return false;
      if (!(obj instanceof js.text.FieldPosition))
        return false;
      var other = obj;

      return (this.beginIndex == other.beginIndex && this.endIndex == other.endIndex && this.field == other.field);
    },

    /**
     * Return a string representation of this FieldPosition.
     *
     * @return a string representation of this object
     */
    "public String toString": function() {
      return this.getClass().getName() + "[field=" + this.field + ",beginIndex=" + this.beginIndex + ",endIndex=" + this.endIndex + ']';
    }

  });

