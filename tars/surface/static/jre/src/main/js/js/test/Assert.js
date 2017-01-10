/*!
 * JSRT JavaScript Library 0.2.1
 * lico.atom@gmail.com
 *
 * Copyright 2008, 2014 Atom Union, Inc.
 * Released under the MIT license
 *
 * Date: 2014年6月25日
 */

$import("js.test.AssertionError", "BootstrapClassLoader");
$import("js.lang.StringBuffer", "BootstrapClassLoader");
$import("js.test.AssertionError", "BootstrapClassLoader");
/**
 * A set of assertion methods useful for writing tests. Only failed assertions
 * are recorded. These methods can be used directly:
 * <code>Assert.assertEquals(...)</code>, however, they read better if they
 * are referenced through static import:<br/>
 *
 * <pre>
 * $import(&quot;js.test.Assert&quot;);
 *    ...
 *    js.test.Assert.assertEquals(...);
 * </pre>
 *
 * @see AssertionError
 */
Class
  .forName({
    name: "public class js.test.Assert",
    /**
     * Protect constructor since it is a static only class
     */
    "protected Assert": function() {},
    /**
     * Fails a test with the given message.
     *
     * @param message
     *            the identifying message for the {@link AssertionError} (<code>null</code>
     *            okay)
     * @see AssertionError
     */
    "static public void fail": function(message) {
      throw new js.test.AssertionError(message);
    },
    /**
     * Asserts that a condition is true. If it isn't it throws an
     * {@link AssertionError} with the given message.
     *
     * @param message
     *            the identifying message for the {@link AssertionError} (<code>null</code>
     *            okay)
     * @param condition
     *            condition to be checked
     */
    "static public void assertTrue": function(message, condition) {
      if (!condition) {
        js.test.Assert.fail(message);
      }
    },

    /**
     * Asserts that a condition is false. If it isn't it throws an
     * {@link AssertionError} with the given message.
     *
     * @param message
     *            the identifying message for the {@link AssertionError} (<code>null</code>
     *            okay)
     * @param condition
     *            condition to be checked
     */
    "static public void assertFalse": function(message, condition) {
      js.test.Assert.assertTrue(message, !condition);
    },

    /**
     * Asserts that two objects are equal. If they are not, an
     * {@link AssertionError} is thrown with the given message. If
     * <code>expected</code> and <code>actual</code> are
     * <code>null</code>, they are considered equal.
     *
     * @param message
     *            the identifying message for the {@link AssertionError} (<code>null</code>
     *            okay)
     * @param expected
     *            expected value
     * @param actual
     *            actual value
     */
    "static public void assertEquals": function(message, expected,
      actual) {
      if (Object.isNull(expected) && Object.isNull(actual)) {
        return;
      }

      if (!Object.isNull(expected) && expected.equals(actual)) {
        return;
      }

      var formatted = new js.lang.StringBuffer();
      if (!Object.isNull(null) && !message.equals("")) {
        formatted.append(message).append(" ");
      }

      formatted.append("expected:<");
      formatted.append(Object.isNull(expected) ? "null" : expected
        .toString());
      formatted.append("> but was:<");
      formatted.append(Object.isNull(actual) ? "null" : actual
        .toString());
      formatted.append(">");

      // TODO float类型判断
      js.test.Assert.fail(formatted.toString());
    },

    /**
     * Asserts that two objects are <b>not</b> equals. If they are, an
     * {@link AssertionError} is thrown with the given message. If
     * <code>first</code> and <code>second</code> are
     * <code>null</code>, they are considered equal.
     *
     * @param message
     *            the identifying message for the {@link AssertionError} (<code>null</code>
     *            okay)
     * @param first
     *            first value to check
     * @param second
     *            the value to check against <code>first</code>
     */
    "static public void assertNotEquals": function(message, expected,
      actual) {

      if (!Object.isNull(expected)) {

        if (!expected.equals(actual)) {
          return;
        }
      } else {
        if (!Object.isNull(expected)) {
          return;
        }
      }

      // TODO float类型判断

      var formatted = new js.lang.StringBuffer();
      formatted.append("Values should be different. ");
      if (!Object.isNull(message)) {
        formatted.append(message).append(". ");
      }

      formatted.append("Actual: ").append(actual);
      js.test.Assert.fail(formatted.toString());
    },

    /**
     * Asserts that an object isn't null. If it is an
     * {@link AssertionError} is thrown with the given message.
     *
     * @param message
     *            the identifying message for the {@link AssertionError} (<code>null</code>
     *            okay)
     * @param object
     *            Object to check or <code>null</code>
     */
    "static public void assertNotNull": function(message, object) {
      js.test.Assert.assertTrue(message, !Object.isNull(object));
    },

    /**
     * Asserts that an object is null. If it is not, an
     * {@link AssertionError} is thrown with the given message.
     *
     * @param message
     *            the identifying message for the {@link AssertionError} (<code>null</code>
     *            okay)
     * @param object
     *            Object to check or <code>null</code>
     */
    "static public void assertNull": function(message, object) {
      if (Object.isNull(object)) {
        return;
      }

      var formatted = new js.lang.StringBuffer();

      if (!Object.isNull(message)) {
        formatted.append(message).append(" ");
      }

      formatted.append("expected null, but was:<").append(actual)
        .append(">");

      js.test.Assert.fail(formatted.toString());
    },

    /**
     * Asserts that two objects refer to the same object. If they are
     * not, an {@link AssertionError} is thrown with the given message.
     *
     * @param message
     *            the identifying message for the {@link AssertionError} (<code>null</code>
     *            okay)
     * @param expected
     *            the expected object
     * @param actual
     *            the object to compare to <code>expected</code>
     */
    "static public void assertSame": function(message, expected,
      actual) {
      if (expected == actual) {
        return;
      }
      var formatted = new js.lang.StringBuffer();
      if (!Object.isNull(message)) {
        formatted.append(message).append(" ");
      }

      formatted.append("expected same:<").append(expected).append(
        "> was not:<").append(actual).append(">");

      js.test.Assert.fail(formatted.toString());
    },

    /**
     * Asserts that two objects do not refer to the same object. If they
     * do refer to the same object, an {@link AssertionError} is thrown
     * with the given message.
     *
     * @param message
     *            the identifying message for the {@link AssertionError} (<code>null</code>
     *            okay)
     * @param unexpected
     *            the object you don't expect
     * @param actual
     *            the object to compare to <code>unexpected</code>
     */
    "static public void assertNotSame": function(message, unexpected,
      actual) {
      if (unexpected !== actual) {
        return;
      }

      var formatted = new js.lang.StringBuffer();
      if (!Object.isNull(message)) {
        formatted.append(message).append(" ");
      }
      formatted.append("expected not same");
      js.test.Assert.fail(formatted.toString());
    },

    /**
     * Asserts that <code>actual</code> satisfies the condition
     * specified by <code>matcher</code>. If not, an
     * {@link AssertionError} is thrown with information about the
     * matcher and failing value. Example:
     *
     * <pre>
     * assertThat(0, is(1)); // fails:
     * // failure message:
     * // expected: is &lt;1&gt;
     * // got value: &lt;0&gt;
     * assertThat(0, is(not(1))) // passes
     * </pre>
     *
     * <code>org.hamcrest.Matcher</code> does not currently document
     * the meaning of its type parameter <code>T</code>. This method
     * assumes that a matcher typed as <code>Matcher&lt;T&gt;</code>
     * can be meaningfully applied only to values that could be assigned
     * to a variable of type <code>T</code>.
     *
     * @param <T>
     *            the static type accepted by the matcher (this can flag
     *            obvious compile-time problems such as
     *            {@code assertThat(1, is("a"))}
     * @param actual
     *            the computed value being compared
     * @param matcher
     *            an expression, built of {@link Matcher}s, specifying
     *            allowed values
     * @see org.hamcrest.CoreMatchers
     * @see org.hamcrest.MatcherAssert
     */
    "public static <T> void assertThat": function(actual, matcher) {
      // TODO 正则表达式
    }
  });

