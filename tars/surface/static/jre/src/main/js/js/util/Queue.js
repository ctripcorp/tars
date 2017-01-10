/*
 * ! JSRT JavaScript Library 0.1.1 lico.atom@gmail.com
 *
 * Copyright 2008, 2015 Atom Union, Inc. Released under the MIT license
 *
 * Date: Feb 1, 2015
 */

$import("js.util.Collection", "BootstrapClassLoader");
$import("js.util.Iterator", "BootstrapClassLoader");
$import("js.util.NoSuchElementException", "BootstrapClassLoader");
$import("js.lang.IllegalStateException", "BootstrapClassLoader");
$import("js.util.NoSuchElementException", "BootstrapClassLoader");
$import("js.lang.NullPointerException", "BootstrapClassLoader");
$import("js.lang.IllegalArgumentException", "BootstrapClassLoader");

Class.forName({
  name: "class js.util.Queue extends js.util.Collection",

  /**
   * Inserts the specified element into this queue if it is possible to do so
   * immediately without violating capacity restrictions, returning
   * <tt>true</tt> upon success and throwing an <tt>IllegalStateException</tt>
   * if no space is currently available.
   *
   * @param e the element to add
   * @return <tt>true</tt> (as specified by {@link Collection#add})
   * @throws IllegalStateException if the element cannot be added at this
   *         time due to capacity restrictions
   * @throws ClassCastException if the class of the specified element
   *         prevents it from being added to this queue
   * @throws NullPointerException if the specified element is null and
   *         this queue does not permit null elements
   * @throws IllegalArgumentException if some property of this element
   *         prevents it from being added to this queue
   */
  "abstract add": function(e) {
    if (this.offer(e))
      return true;
    else
      throw new js.lang.IllegalStateException("Queue full");
  },

  /**
   * Inserts the specified element into this queue if it is possible to do
   * so immediately without violating capacity restrictions.
   * When using a capacity-restricted queue, this method is generally
   * preferable to {@link #add}, which can fail to insert an element only
   * by throwing an exception.
   *
   * @param e the element to add
   * @return <tt>true</tt> if the element was added to this queue, else
   *         <tt>false</tt>
   * @throws ClassCastException if the class of the specified element
   *         prevents it from being added to this queue
   * @throws NullPointerException if the specified element is null and
   *         this queue does not permit null elements
   * @throws IllegalArgumentException if some property of this element
   *         prevents it from being added to this queue
   */
  "abstract offer": function(e) {},

  /**
   * Retrieves and removes the head of this queue.  This method differs
   * from {@link #poll poll} only in that it throws an exception if this
   * queue is empty.
   *
   * @return the head of this queue
   * @throws NoSuchElementException if this queue is empty
   */
  "abstract remove": function() {
    var x = this.poll();
    if (!Object.isNull(x))
      return x;
    else
      throw new js.util.NoSuchElementException();
  },

  /**
   * Retrieves and removes the head of this queue,
   * or returns <tt>null</tt> if this queue is empty.
   *
   * @return the head of this queue, or <tt>null</tt> if this queue is empty
   */
  "abstract poll": function() {},

  /**
   * Retrieves, but does not remove, the head of this queue.  This method
   * differs from {@link #peek peek} only in that it throws an exception
   * if this queue is empty.
   *
   * @return the head of this queue
   * @throws NoSuchElementException if this queue is empty
   */
  "abstract element": function() {
    var x = peek();
    if (!Object.isNull(x))
      return x;
    else
      throw new js.util.NoSuchElementException();
  },

  /**
   * Retrieves, but does not remove, the head of this queue,
   * or returns <tt>null</tt> if this queue is empty.
   *
   * @return the head of this queue, or <tt>null</tt> if this queue is empty
   */
  "abstract peek": function() {},

  "clear": function() {
    while (!Object.isNull(this.poll()));
  },

  /**
   * Adds all of the elements in the specified collection to this
   * queue.  Attempts to addAll of a queue to itself result in
   * <tt>IllegalArgumentException</tt>. Further, the behavior of
   * this operation is undefined if the specified collection is
   * modified while the operation is in progress.
   *
   * <p>This implementation iterates over the specified collection,
   * and adds each element returned by the iterator to this
   * queue, in turn.  A runtime exception encountered while
   * trying to add an element (including, in particular, a
   * <tt>null</tt> element) may result in only some of the elements
   * having been successfully added when the associated exception is
   * thrown.
   *
   * @param c collection containing elements to be added to this queue
   * @return <tt>true</tt> if this queue changed as a result of the call
   * @throws ClassCastException if the class of an element of the specified
   *         collection prevents it from being added to this queue
   * @throws NullPointerException if the specified collection contains a
   *         null element and this queue does not permit null elements,
   *         or if the specified collection is null
   * @throws IllegalArgumentException if some property of an element of the
   *         specified collection prevents it from being added to this
   *         queue, or if the specified collection is this queue
   * @throws IllegalStateException if not all the elements can be added at
   *         this time due to insertion restrictions
   * @see #add(Object)
   */
  "addAll": function(c) {
    if (Object.isNull(c))
      throw new js.lang.NullPointerException();
    if (c == this)
      throw new js.lang.IllegalArgumentException();
    var modified = false,
      itr = c.iterator();
    while (itr.hasNext())
      if (add(itr.next()))
        modified = true;
    return modified;
  }
});

