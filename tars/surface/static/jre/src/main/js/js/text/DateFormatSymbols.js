/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2014年10月13日
 */

$import("js.util.Arrays", "BootstrapClassLoader");

Class
  .forName({
    name: "class js.text.DateFormatSymbols extends Object",

    /**
     * Construct a DateFormatSymbols object by loading format data from
     * resources for the default locale. This constructor can only
     * construct instances for the locales supported by the Java runtime
     * environment, not for those supported by installed
     * {@link java.text.spi.DateFormatSymbolsProvider DateFormatSymbolsProvider}
     * implementations. For full locale coverage, use the
     * {@link #getInstance(Locale) getInstance} method.
     *
     * @see #getInstance()
     * @exception java.util.MissingResourceException
     *                if the resources for the default locale cannot be
     *                found or cannot be loaded.
     */
    "public DateFormatSymbols": function() {
      this.initializeData();
    },

    /**
     * Era strings. For example: "AD" and "BC". An array of 2 strings,
     * indexed by <code>Calendar.BC</code> and
     * <code>Calendar.AD</code>.
     *
     * @serial
     */
    "eras": null,

    /**
     * Month strings. For example: "January", "February", etc. An array
     * of 13 strings (some calendars have 13 months), indexed by
     * <code>Calendar.JANUARY</code>, <code>Calendar.FEBRUARY</code>,
     * etc.
     *
     * @serial
     */
    "months": null,

    /**
     * Short month strings. For example: "Jan", "Feb", etc. An array of
     * 13 strings (some calendars have 13 months), indexed by
     * <code>Calendar.JANUARY</code>, <code>Calendar.FEBRUARY</code>,
     * etc.
     *
     * @serial
     */
    "shortMonths": null,

    /**
     * Weekday strings. For example: "Sunday", "Monday", etc. An array
     * of 8 strings, indexed by <code>Calendar.SUNDAY</code>,
     * <code>Calendar.MONDAY</code>, etc. The element
     * <code>weekdays[0]</code> is ignored.
     *
     * @serial
     */
    "weekdays": null,

    /**
     * Short weekday strings. For example: "Sun", "Mon", etc. An array
     * of 8 strings, indexed by <code>Calendar.SUNDAY</code>,
     * <code>Calendar.MONDAY</code>, etc. The element
     * <code>shortWeekdays[0]</code> is ignored.
     *
     * @serial
     */
    "shortWeekdays": null,

    /**
     * AM and PM strings. For example: "AM" and "PM". An array of 2
     * strings, indexed by <code>Calendar.AM</code> and
     * <code>Calendar.PM</code>.
     *
     * @serial
     */
    "ampms": null,

    /**
     * Unlocalized date-time pattern characters. For example: 'y', 'd',
     * etc. All locales use the same these unlocalized pattern
     * characters.
     */
    "static final patternChars": "GyMdkHmsSEDFwWahKzZYuX",
    "static final oppositePatternChars": "AbBcCefgiIjJlLnNoOpPqQrRtTUvVx",

    "static final PATTERN_ERA": 0, // G
    "static final PATTERN_YEAR": 1, // y
    "static final PATTERN_MONTH": 2, // M
    "static final PATTERN_DAY_OF_MONTH": 3, // d
    "static final PATTERN_HOUR_OF_DAY1": 4, // k
    "static final PATTERN_HOUR_OF_DAY0": 5, // H
    "static final PATTERN_MINUTE": 6, // m
    "static final PATTERN_SECOND": 7, // s
    "static final PATTERN_MILLISECOND": 8, // S
    "static final PATTERN_DAY_OF_WEEK": 9, // E
    "static final PATTERN_DAY_OF_YEAR": 10, // D
    "static final PATTERN_DAY_OF_WEEK_IN_MONTH": 11, // F
    "static final PATTERN_WEEK_OF_YEAR": 12, // w
    "static final PATTERN_WEEK_OF_MONTH": 13, // W
    "static final PATTERN_AM_PM": 14, // a
    "static final PATTERN_HOUR1": 15, // h
    "static final PATTERN_HOUR0": 16, // K
    "static final PATTERN_ZONE_NAME": 17, // z
    "static final PATTERN_ZONE_VALUE": 18, // Z
    "static final PATTERN_WEEK_YEAR": 19, // Y
    "static final PATTERN_ISO_DAY_OF_WEEK": 20, // u
    "static final PATTERN_ISO_ZONE": 21, // X

    /**
     * Localized date-time pattern characters. For example, a locale may
     * wish to use 'u' rather than 'y' to represent years in its date
     * format pattern strings. This string must be exactly 18 characters
     * long, with the index of the characters described by
     * <code>DateFormat.ERA_FIELD</code>,
     * <code>DateFormat.YEAR_FIELD</code>, etc. Thus, if the string
     * were "Xz...", then localized patterns would use 'X' for era and
     * 'z' for year.
     *
     * @serial
     */
    "localPatternChars": null,

    /**
     * Gets the <code>DateFormatSymbols</code> instance for the
     * default locale. This method provides access to
     * <code>DateFormatSymbols</code> instances for locales supported
     * by the Java runtime itself as well as for those supported by
     * installed
     * {@link java.text.spi.DateFormatSymbolsProvider DateFormatSymbolsProvider}
     * implementations.
     *
     * @return a <code>DateFormatSymbols</code> instance.
     */
    "public static final getInstance": function() {
      return new js.text.DateFormatSymbols();
    },

    /**
     * Gets era strings. For example: "AD" and "BC".
     *
     * @return the era strings.
     */
    "public getEras": function() {
      return js.util.Arrays.copyOf(this.eras, this.eras.length);
    },

    /**
     * Sets era strings. For example: "AD" and "BC".
     *
     * @param newEras
     *            the new era strings.
     */
    "public void setEras": function(newEras) {
      this.eras = js.util.Arrays.copyOf(newEras, newEras.length);
    },

    /**
     * Gets month strings. For example: "January", "February", etc.
     *
     * @return the month strings.
     */
    "public getMonths": function() {
      return js.util.Arrays.copyOf(this.months, this.months.length);
    },

    /**
     * Sets month strings. For example: "January", "February", etc.
     *
     * @param newMonths
     *            the new month strings.
     */
    "public void setMonths": function(newMonths) {
      this.months = js.util.Arrays
        .copyOf(newMonths, newMonths.length);
    },

    /**
     * Gets short month strings. For example: "Jan", "Feb", etc.
     *
     * @return the short month strings.
     */
    "public getShortMonths": function() {
      return js.util.Arrays.copyOf(this.shortMonths,
        this.shortMonths.length);
    },

    /**
     * Sets short month strings. For example: "Jan", "Feb", etc.
     *
     * @param newShortMonths
     *            the new short month strings.
     */
    "public void setShortMonths": function(newShortMonths) {
      this.shortMonths = js.util.Arrays.copyOf(newShortMonths,
        newShortMonths.length);
    },

    /**
     * Gets weekday strings. For example: "Sunday", "Monday", etc.
     *
     * @return the weekday strings. Use <code>Calendar.SUNDAY</code>,
     *         <code>Calendar.MONDAY</code>, etc. to index the result
     *         array.
     */
    "public getWeekdays": function() {
      return js.util.Arrays.copyOf(this.weekdays,
        this.weekdays.length);
    },

    /**
     * Sets weekday strings. For example: "Sunday", "Monday", etc.
     *
     * @param newWeekdays
     *            the new weekday strings. The array should be indexed
     *            by <code>Calendar.SUNDAY</code>,
     *            <code>Calendar.MONDAY</code>, etc.
     */
    "public void setWeekdays": function(newWeekdays) {
      this.weekdays = js.util.Arrays.copyOf(newWeekdays,
        newWeekdays.length);
    },

    /**
     * Gets short weekday strings. For example: "Sun", "Mon", etc.
     *
     * @return the short weekday strings. Use
     *         <code>Calendar.SUNDAY</code>,
     *         <code>Calendar.MONDAY</code>, etc. to index the result
     *         array.
     */
    "public getShortWeekdays": function() {
      return js.util.Arrays.copyOf(this.shortWeekdays,
        this.shortWeekdays.length);
    },

    /**
     * Sets short weekday strings. For example: "Sun", "Mon", etc.
     *
     * @param newShortWeekdays
     *            the new short weekday strings. The array should be
     *            indexed by <code>Calendar.SUNDAY</code>,
     *            <code>Calendar.MONDAY</code>, etc.
     */
    "public void setShortWeekdays": function(newShortWeekdays) {
      this.shortWeekdays = js.util.Arrays.copyOf(newShortWeekdays,
        newShortWeekdays.length);
    },

    /**
     * Gets ampm strings. For example: "AM" and "PM".
     *
     * @return the ampm strings.
     */
    "public getAmPmStrings": function() {
      return js.util.Arrays.copyOf(this.ampms, this.ampms.length);
    },

    /**
     * Sets ampm strings. For example: "AM" and "PM".
     *
     * @param newAmpms
     *            the new ampm strings.
     */
    "public void setAmPmStrings": function(newAmpms) {
      this.ampms = js.util.Arrays.copyOf(newAmpms, newAmpms.length);
    },

    /**
     * Gets localized date-time pattern characters. For example: 'u',
     * 't', etc.
     *
     * @return the localized date-time pattern characters.
     */
    "public String getLocalPatternChars": function() {
      return this.localPatternChars;
    },

    /**
     * Sets localized date-time pattern characters. For example: 'u',
     * 't', etc.
     *
     * @param newLocalPatternChars
     *            the new localized date-time pattern characters.
     */
    "public void setLocalPatternChars": function(newLocalPatternChars) {
      // Call toString() to throw an NPE in case the argument is null
      this.localPatternChars = newLocalPatternChars.toString();
    },

    /**
     * Overrides Cloneable
     */
    "public Object clone": function() {
      try {
        var other = this.getClass().newInstance();
        this.copyMembers(this, other);
        return other;
      } catch (e) {
        throw new js.lang.CloneNotSupportedException();
      }
    },

    /**
     * Override equals
     */
    "public boolean equals": function(obj) {
      if (this == obj) {
        return true;
      }
      if (Object.isNull(obj) || this.getClass() != obj.getClass()) {
        return false;
      }
      var that = obj;
      return (js.util.Arrays.equals(this.eras, that.eras) && js.util.Arrays.equals(this.months, that.months) && js.util.Arrays.equals(this.shortMonths,
        that.shortMonths) && js.util.Arrays.equals(this.weekdays, that.weekdays) && js.util.Arrays.equals(this.shortWeekdays,
        that.shortWeekdays) && js.util.Arrays.equals(this.ampms, that.ampms) && Arrays.deepEquals(this.getZoneStringsWrapper(), that
        .getZoneStringsWrapper()) && ((!Object.isNull(this.localPatternChars) && this.localPatternChars
        .equals(that.localPatternChars)) || (Object.isNull(this.localPatternChars) && Object.isNull(that.localPatternChars))));
    },

    // =======================privates===============================

    /**
     * Useful constant for defining time zone offsets.
     */
    "static final int millisPerHour": 60 * 60 * 1000,

    "private transient int lastZoneIndex": 0,

    "private void initializeData": function() {
      this.eras = ["公元前", "公元"];
      this.months = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月",
        "九月", "十月", "十一月", "十二月", ""
      ];
      this.shortMonths = ["一月", "二月", "三月", "四月", "五月", "六月", "七月",
        "八月", "九月", "十月", "十一月", "十二月", ""
      ];
      this.ampms = ["上午", "下午"];
      this.localPatternChars = "GanjkHmsSEDFwWxhKzZ";

      // Day of week names are stored in a 1-based array.
      this.weekdays = ["", "星期日", "星期一", "星期二", "星期三", "星期四", "星期五",
        "星期六"
      ];
      this.shortWeekdays = ["", "星期日", "星期一", "星期二", "星期三", "星期四",
        "星期五", "星期六"
      ];
    },

    /**
     * Clones all the data members from the source DateFormatSymbols to
     * the target DateFormatSymbols. This is only for subclasses.
     *
     * @param src
     *            the source DateFormatSymbols.
     * @param dst
     *            the target DateFormatSymbols.
     */
    "private final copyMembers": function(src, dst) {
      dst.eras = js.util.Arrays.copyOf(src.eras, src.eras.length);
      dst.months = js.util.Arrays.copyOf(src.months,
        src.months.length);
      dst.shortMonths = js.util.Arrays.copyOf(src.shortMonths,
        src.shortMonths.length);
      dst.weekdays = js.util.Arrays.copyOf(src.weekdays,
        src.weekdays.length);
      dst.shortWeekdays = js.util.Arrays.copyOf(src.shortWeekdays,
        src.shortWeekdays.length);
      dst.ampms = js.util.Arrays.copyOf(src.ampms, src.ampms.length);

      dst.localPatternChars = src.localPatternChars;
    }

  });

