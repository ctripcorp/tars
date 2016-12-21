/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 16, 2014
 */
$import("js.lang.StringBuffer", "BootstrapClassLoader");
$import("js.text.DateFormat", "BootstrapClassLoader");
$import("js.text.DateFormatSymbols", "BootstrapClassLoader");
$import("js.text.FieldPosition", "BootstrapClassLoader");
$import("js.util.GregorianCalendar", "BootstrapClassLoader");

/**
 * 字母 日期或时间元素 表示 示例
 *
 * G Era 标志符 Text AD y 年 Year 1996; 96
 *
 * M 年中的月份 Month July; Jul;07
 *
 * w 年中的周数 Number 27
 *
 * W 月份中的周数 Number 2
 *
 * D 年中的天数 Number 189
 *
 * d 月份中的天数 Number 10
 *
 * F 月份中的星期 Number 2
 *
 * E 星期中的天数 Text Tuesday; Tue
 *
 * a Am/pm 标记 Text PM
 *
 * H 一天中的小时数（0-23） Number 0
 *
 * k 一天中的小时数（1-24） Number 24
 *
 * K am/pm 中的小时数（0-11） Number 0
 *
 * h am/pm 中的小时数（1-12） Number 12
 *
 * m 小时中的分钟数 Number 30
 *
 * s 分钟中的秒数 Number 55
 *
 * S 毫秒数 Number 978
 *
 * z 时区 General time zone Pacific Standard Time; PST; GMT-08:00
 *
 * Z 时区
 */
Class
  .forName({
    name: 'abstract class js.text.SimpleDateFormat extends js.text.DateFormat',

    'private pattern': null,
    'private compiledPattern': null,
    'private dateFormatSymbols': null,
    'private useDateFormatSymbols': false,

    // Maps from DecimalFormatSymbols index to Field constant
    'private static final PATTERN_INDEX_TO_CALENDAR_FIELD': [
      js.util.Calendar.ERA, js.util.Calendar.YEAR,
      js.util.Calendar.MONTH, js.util.Calendar.DATE,
      js.util.Calendar.HOUR_OF_DAY, js.util.Calendar.HOUR_OF_DAY,
      js.util.Calendar.MINUTE, js.util.Calendar.SECOND,
      js.util.Calendar.MILLISECOND, js.util.Calendar.DAY_OF_WEEK,
      js.util.Calendar.DAY_OF_YEAR,
      js.util.Calendar.DAY_OF_WEEK_IN_MONTH,
      js.util.Calendar.WEEK_OF_YEAR,
      js.util.Calendar.WEEK_OF_MONTH, js.util.Calendar.AM_PM,
      js.util.Calendar.HOUR, js.util.Calendar.HOUR,
      js.util.Calendar.ZONE_OFFSET, js.util.Calendar.ZONE_OFFSET,
      // Pseudo Calendar fields
      js.util.Calendar.WEEK_YEAR,
      js.util.Calendar.ISO_DAY_OF_WEEK,
      js.util.Calendar.ZONE_OFFSET
    ],

    // Map index into pattern character string to DateFormat field
    // number
    'private static final PATTERN_INDEX_TO_DATE_FORMAT_FIELD': [
      js.text.DateFormat.ERA_FIELD,
      js.text.DateFormat.YEAR_FIELD,
      js.text.DateFormat.MONTH_FIELD,
      js.text.DateFormat.DATE_FIELD,
      js.text.DateFormat.HOUR_OF_DAY1_FIELD,
      js.text.DateFormat.HOUR_OF_DAY0_FIELD,
      js.text.DateFormat.MINUTE_FIELD,
      js.text.DateFormat.SECOND_FIELD,
      js.text.DateFormat.MILLISECOND_FIELD,
      js.text.DateFormat.DAY_OF_WEEK_FIELD,
      js.text.DateFormat.DAY_OF_YEAR_FIELD,
      js.text.DateFormat.DAY_OF_WEEK_IN_MONTH_FIELD,
      js.text.DateFormat.WEEK_OF_YEAR_FIELD,
      js.text.DateFormat.WEEK_OF_MONTH_FIELD,
      js.text.DateFormat.AM_PM_FIELD,
      js.text.DateFormat.HOUR1_FIELD,
      js.text.DateFormat.HOUR0_FIELD,
      js.text.DateFormat.TIMEZONE_FIELD,
      js.text.DateFormat.TIMEZONE_FIELD,
      js.text.DateFormat.YEAR_FIELD,
      js.text.DateFormat.DAY_OF_WEEK_FIELD,
      js.text.DateFormat.TIMEZONE_FIELD
    ],

    SimpleDateFormat: function(pattern, formatSymbols) {
      if (Object.isNull(pattern)) {
        throw new js.lang.NullPointerException();
      }
      this.pattern = pattern;
      if (!formatSymbols) {
        this.dateFormatSymbols = js.text.DateFormatSymbols.getInstance();
      } else {
        this.dateFormatSymbols = formatSymbols.clone();
        this.useDateFormatSymbols = true;
      }
      this.initializeCalendar();
      this.initialize();
    },

    /* Initialize compiledPattern and numberFormat fields */
    'private initialize': function() {
      // Verify and compile the given pattern.
      this.compiledPattern = this.compile(this.pattern);
    },

    'private initializeCalendar': function() {
      if (Object.isNull(this.calendar)) {
        // The format object must be constructed using the symbols
        // for this zone.
        // However, the calendar should use the current default
        // TimeZone.
        // If this is not contained in the locale zone strings, then
        // the zone
        // will be formatted using generic GMT+/-H:MM nomenclature.
        this.calendar = js.util.Calendar.getInstance();
      }
    },

    /**
     * Returns the compiled form of the given pattern. The syntax of the
     * compiled pattern is: <blockquote> CompiledPattern: EntryList
     * EntryList: Entry EntryList Entry Entry: TagField TagField data
     * TagField: Tag Length TaggedData Tag: pattern_char_index
     * TAG_QUOTE_CHARS Length: short_length long_length TaggedData:
     * TAG_QUOTE_ASCII_CHAR ascii_char
     *
     * </blockquote>
     *
     * where `short_length' is an 8-bit unsigned integer between 0 and
     * 254. `long_length' is a sequence of an 8-bit integer 255 and a
     * 32-bit signed integer value which is split into upper and lower
     * 16-bit fields in two char's. `pattern_char_index' is an 8-bit
     * integer between 0 and 18. `ascii_char' is an 7-bit ASCII
     * character value. `data' depends on its Tag value.
     * <p>
     * If Length is short_length, Tag and short_length are packed in a
     * single char, as illustrated below. <blockquote> char[0] = (Tag <<
     * 8) | short_length; </blockquote>
     *
     * If Length is long_length, Tag and 255 are packed in the first
     * char and a 32-bit integer, as illustrated below. <blockquote>
     * char[0] = (Tag << 8) | 255; char[1] = (char) (long_length >>>
     * 16); char[2] = (char) (long_length & 0xffff); </blockquote>
     * <p>
     * If Tag is a pattern_char_index, its Length is the number of
     * pattern characters. For example, if the given pattern is "yyyy",
     * Tag is 1 and Length is 4, followed by no data.
     * <p>
     * If Tag is TAG_QUOTE_CHARS, its Length is the number of char's
     * following the TagField. For example, if the given pattern is
     * "'o''clock'", Length is 7 followed by a char sequence of
     * <code>o&nbs;'&nbs;c&nbs;l&nbs;o&nbs;c&nbs;k</code>.
     * <p>
     * TAG_QUOTE_ASCII_CHAR is a special tag and has an ASCII character
     * in place of Length. For example, if the given pattern is "'o'",
     * the TaggedData entry is
     * <code>((TAG_QUOTE_ASCII_CHAR&nbs;<<&nbs;8)&nbs;|&nbs;'o')</code>.
     *
     * @exception NullPointerException
     *                if the given pattern is null
     * @exception IllegalArgumentException
     *                if the given pattern is invalid
     */
    'private compile': function(pattern) {
      // TODO
      var length = pattern.getLength();
      var inQuote = false;
      var compiledPattern = [];

      var symbols = js.text.DateFormatSymbols.patternChars,
        opposites = js.text.DateFormatSymbols.oppositePatternChars;
      // var patternFormatMap =
      // js.text.SimpleDateFormat.PATTERN_INDEX_TO_DATE_FORMAT_FIELD;

      var result = new js.lang.StringBuffer(),
        symbol = -1,
        preC = null,
        preSymbol = -1;

      var push = function(compiledPattern, preSymbol, result) {

        if (result.length() > 0) {

          if (!Object.isNull(preSymbol) && preSymbol > -1) {
            compiledPattern.push(new js.text.FieldPosition(
              preSymbol, 0, result.length()));
          } else {
            compiledPattern.push(result.toString());

          }
          result.clear();

        }
      };

      for (var i = 0; i < length; ++i) {
        var c = pattern.charAt(i);
        if (inQuote) {
          // 引号结束
          if (c === '\'') {
            inQuote = false;

            if (preC == c) {
              result.append(c);
            }

            compiledPattern.push(result.toString());
            preC = c;
            continue;
          }
        } else {
          // 引号开始
          if (c === '\'') {
            inQuote = true;

            push(compiledPattern, preSymbol, result);

            preC = c;
            preSymbol = null;

            continue;
          } else if ((symbol = symbols.indexOf(c)) != -1) {

            if (preC !== c) {
              push(compiledPattern, preSymbol, result);
            }

            preSymbol = symbol;

          } else {

            if (opposites.indexOf(c) !== -1) {

              throw new js.lang.IllegalArgumentException(
                "Illegal pattern " + " character '" + c + "'");
            } else {

              if (!Object.isNull(preSymbol) && preSymbol > -1) {
                compiledPattern
                  .push(new js.text.FieldPosition(
                    preSymbol, 0, result
                    .length()));
                result.clear();
              }

              preSymbol = null;
            }
          }
        }

        preC = c;
        result.append(c);
      }

      if (result.length() > 0) {
        push(compiledPattern, preSymbol, result);

      }

      if (inQuote) {
        throw new js.lang.IllegalArgumentException(
          "Unterminated quote");
      }

      return compiledPattern;
    },
    /** 格式化一个对象以生成一个字符串。 */
    'private formatDate': function(date) {
      var Calendar = js.util.Calendar;
      // TODO
      // Convert input date to time field list
      this.calendar.setTime(date);

      var useDateFormatSymbols = this.isUseDateFormatSymbols();
      var result = new js.lang.StringBuffer();

      var patternCalendarMap = js.text.SimpleDateFormat.PATTERN_INDEX_TO_CALENDAR_FIELD;

      for (var i = 0; i < this.compiledPattern.length; i++) {
        var tag = this.compiledPattern[i];

        if (Object.isInstanceof(tag, js.text.FieldPosition)) {
          var field = tag.getField();
          var value = this.calendar
            .get(patternCalendarMap[field]);
          var current = null,
            count = tag.getEndIndex() - tag.getBeginIndex();
          switch (field) {

            case js.text.DateFormatSymbols.PATTERN_ERA: // 'G'
              if (useDateFormatSymbols) {
                var eras = this.dateFormatSymbols.getEras();
                if (value < eras.length)
                  current = eras[value];
              }
              if (Object.isNull(current))
                current = "";
              break;

            case js.text.DateFormatSymbols.PATTERN_YEAR: // 'y'
              if (count !== 2)
                current = value;
              else
              // count == 2
                current = value % 100;
              break;

            case js.text.DateFormatSymbols.PATTERN_MONTH: // 'M'
              if (useDateFormatSymbols) {
                var months;
                if (count >= 4) {
                  months = this.dateFormatSymbols.getMonths();
                  current = months[value];
                } else if (count === 3) {
                  months = this.dateFormatSymbols.getShortMonths();
                  current = months[value];
                }
              } else {
                if (count < 3) {
                  current = null;
                }
              }
              if (Object.isNull(current)) {
                value += 1;
                current = count >= 2 && value < 10 ? '0' + value : value;
              }
              break;

            case js.text.DateFormatSymbols.PATTERN_DAY_OF_WEEK: // 'E'
              if (useDateFormatSymbols) {
                var weekdays;
                if (count >= 4) {
                  weekdays = this.dateFormatSymbols.getWeekdays();
                  current = weekdays[value];
                } else { // count < 4, use abbreviated form
                  // if exists
                  weekdays = this.dateFormatSymbols
                    .getShortWeekdays();
                  current = weekdays[value];
                }
              }

              if (Object.isNull(current)) {
                current = value;
              }

              break;

            case js.text.DateFormatSymbols.PATTERN_AM_PM: // 'a'
              if (useDateFormatSymbols) {
                var ampm = this.dateFormatSymbols.getAmPmStrings();
                current = ampm[value];
              } else {
                current = value ? "PM" : "AM";
              }
              break;
            case js.text.DateFormatSymbols.PATTERN_HOUR_OF_DAY1: // 'k'
              // 1-based.
              // eg,
              // 23:59
              // +
              // 1 hour =>> 24:59

              if (value < 1)
                current = 24;
              else
                current = count >= 2 && value < 10 ? '0' + value : value;
              break;

            case js.text.DateFormatSymbols.PATTERN_HOUR1: // 'h'
              // 1-based.
              // eg,
              // 11PM
              // + 1
              // hour
              // =>> 12 AM
              if (value < 1)
                current = 12;
              else
                current = count >= 2 && value < 10 ? '0' + value : value;
              break;

            case js.text.DateFormatSymbols.PATTERN_MINUTE: //
              // 'm'

            case js.text.DateFormatSymbols.PATTERN_SECOND: //
              // 's'

            case js.text.DateFormatSymbols.PATTERN_HOUR_OF_DAY0:
              // 'H' 0-based. eg, 23:59 + 1 hour =>> 00:59
            case js.text.DateFormatSymbols.PATTERN_DAY_OF_MONTH: // 'd'

            case js.text.DateFormatSymbols.PATTERN_WEEK_OF_YEAR:
              // // 'w'

              current = count >= 2 && value < 10 ? '0' + value : value;

              break;

            case js.text.DateFormatSymbols.PATTERN_MILLISECOND: //
              // 'S'

            case js.text.DateFormatSymbols.PATTERN_DAY_OF_YEAR: //
              // 'D'

              if (count >= 3) {
                if (value < 10) {
                  current = '00' + value;
                } else if (value < 100) {
                  current = '0' + value;
                } else {
                  current = value;
                }

              } else if (count >= 2) {
                current = value < 10 ? '0' + value : value;

              } else {
                current = value;
              }

              break;
              /*
               * case PATTERN_ZONE_NAME: // 'z'
               *
               * break;
               *
               * case PATTERN_ZONE_VALUE: // 'Z' ("-/+hhmm" form)
               *
               * break;
               *
               * case PATTERN_ISO_ZONE: // 'X'
               *
               * break;
               */
            default:

              // case
              // js.text.DateFormatSymbols.PATTERN_DAY_OF_WEEK_IN_MONTH:
              // // 'F'

              // case
              // js.text.DateFormatSymbols.PATTERN_WEEK_OF_MONTH:
              // // 'W'

              // case js.text.DateFormatSymbols.PATTERN_HOUR0: //
              // 'K' eg, 11PM + 1 hour =>>
              // 0 AM

              // case
              // js.text.DateFormatSymbols.PATTERN_ISO_DAY_OF_WEEK:
              // // 'u' pseudo
              // field, Monday = 1, ..., Sunday = 7

              current = value;
              break;
          } // switch (patternCharIndex)
          result.append(current);
        } else {
          result.append(tag);
        }
      }
      return result;

    },
    /** 从给定字符串的开始分析文本，以生成一个日期。 */
    'parse': function(source) {},

    "private boolean isUseDateFormatSymbols": function() {
      if (this.useDateFormatSymbols) {
        return true;
      }
      return Object.isInstanceof(this.calendar,
        js.util.GregorianCalendar);
    },
    /**
     * Translates a pattern, mapping each character in the from string
     * to the corresponding character in the to string.
     *
     * @exception IllegalArgumentException
     *                if the given pattern is invalid
     */
    "private String translatePattern": function(pattern, from, to) {
      var result = new js.lang.StringBuffer();
      var inQuote = false;
      for (var i = 0; i < pattern.length(); ++i) {
        var c = pattern.charAt(i);
        if (inQuote) {
          if (c === '\'')
            inQuote = false;
        } else {
          if (c === '\'')
            inQuote = true;
          else if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
            var ci = from.indexOf(c);
            if (ci >= 0) {
              // patternChars is longer than localPatternChars
              // due
              // to serialization compatibility. The pattern
              // letters
              // unsupported by localPatternChars pass
              // through.
              if (ci < to.length()) {
                c = to.charAt(ci);
              }
            } else {
              throw new js.lang.IllegalArgumentException(
                "Illegal pattern " + " character '" + c + "'");
            }
          }
        }
        result.append(c);
      }
      if (inQuote)
        throw new js.lang.IllegalArgumentException(
          "Unfinished quote in pattern");
      return result.toString();
    },

    /**
     * Returns a pattern string describing this date format.
     *
     * @return a pattern string describing this date format.
     */
    "public String toPattern": function() {
      return this.pattern;
    },

    /**
     * Returns a localized pattern string describing this date format.
     *
     * @return a localized pattern string describing this date format.
     */
    "public String toLocalizedPattern": function() {
      return this.translatePattern(this.pattern,
        js.text.DateFormatSymbols.patternChars, this.dateFormatSymbols
        .getLocalPatternChars());
    },

    /**
     * Applies the given pattern string to this date format.
     *
     * @param pattern
     *            the new date and time pattern for this date format
     * @exception NullPointerException
     *                if the given pattern is null
     * @exception IllegalArgumentException
     *                if the given pattern is invalid
     */
    "public void applyPattern": function(pattern) {
      this.compiledPattern = this.compile(pattern);
      this.pattern = pattern;
    },

    /**
     * Applies the given localized pattern string to this date format.
     *
     * @param pattern
     *            a String to be mapped to the new date and time format
     *            pattern for this format
     * @exception NullPointerException
     *                if the given pattern is null
     * @exception IllegalArgumentException
     *                if the given pattern is invalid
     */
    "public void applyLocalizedPattern": function(pattern) {
      var p = this.translatePattern(pattern, this.dateFormatSymbols
        .getLocalPatternChars(),
        js.text.DateFormatSymbols.patternChars);
      this.compiledPattern = this.compile(p);
      this.pattern = p;
    },

    /**
     * Gets a copy of the date and time format symbols of this date
     * format.
     *
     * @return the date and time format symbols of this date format
     * @see #setDateFormatSymbols
     */
    "public DateFormatSymbols getDateFormatSymbols": function() {
      return this.dateFormatSymbols.clone();
    },

    /**
     * Sets the date and time format symbols of this date format.
     *
     * @param newFormatSymbols
     *            the new date and time format symbols
     * @exception NullPointerException
     *                if the given newFormatSymbols is null
     * @see #getDateFormatSymbols
     */
    "public void setDateFormatSymbols": function(newFormatSymbols) {
      this.dateFormatSymbols = newFormatSymbols.clone();
      this.useDateFormatSymbols = true;
    },

    /**
     * Creates a copy of this <code>SimpleDateFormat</code>. This
     * also clones the format's date format symbols.
     *
     * @return a clone of this <code>SimpleDateFormat</code>
     */
    "public Object clone": function() {
      var other = this.getClass().newInstance();
      other.dateFormatSymbols = this.dateFormatSymbols.clone();
      return other;
    },

    /**
     * Compares the given object with this <code>SimpleDateFormat</code>
     * for equality.
     *
     * @return true if the given object is equal to this
     *         <code>SimpleDateFormat</code>
     */
    "public boolean equals": function(obj) {
      if (!obj) {
        return false;
      }
      var that = obj;
      if (!Object.isInstanceof(that, js.text.SimpleDateForma)) {
        return false;
      }
      return (this.pattern.equals(that.pattern) && this.dateFormatSymbols
        .equals(that.dateFormatSymbols));
    }
  });

