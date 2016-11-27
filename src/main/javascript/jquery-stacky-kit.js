//
// jquery-stacky-kit.js
// jquery-stacky-kit
//
//
//
//

/**
 * @author corderoi
 * Original license:
 * @license Sticky-kit v1.1.2 | WTFPL | Leaf Corcoran 2015 | http://leafo.net
 * Modified by corderoi on 23 November 2016
 *
 * Mod notes:
 * - Allow specifying the container via the 'container' option rather than
 *  the original and rather useless window-only sticky functionality. Note: The
 *  container must be the top-level scrolling container and it must have
 *  position: static (this is the default). It is advisable to wrap this
 *  container in a container with position: relative: the sticky elements will
 *  stick to this outer container, if it is omitted they will stick to the
 *  nearest parent with position: relative.
 * - Throttle execution of window scroll callback (requires underscore.js
 *  throttle() and debounce() functions) to improve performance.
 * - Additional reload call to do a manual reinitialization of the plugin
 * - Pass the string message "destroy" to the plugin function to destroy plugin
 *
 * Dependencies:
 * 1. jQuery
 * 2. underscore
 *
 * Note: because of a bug in recalculating after window resize, the plugin is
 * destroyed and reinitialized on window resize rather than simply recalculating
 * variables. Until I/someone figures out how to fix these bugs this will have
 * to do.
 *
 * Note: this JavaScript was originally generated from CoffeeScript, but the
 * modifications are made on the JS (this file).
 */
(function() {
    var $, _, win, $window;

    $ = this.jQuery || window.jQuery;
    _ = this._ || window._;

    $window = $(window);

    /**
     * Sticks the specified element in the specified container.
     *
     * Sticky elements are bound by their direct parent container and will scroll
     * out of view if the parent scrolls out of view. The specified container
     * must have position: static and an outer container with position: relative
     * is needed to stick to (the inner scrolling container is what you specify
     * here).
     * @param opts: object
     *          container: jQuery - jQuery selector for the container to affix
     *                      the sticky elements to
     * @returns {$} - The jq element
     */
    $.fn.stackyKit = function(opts) {
        var elm, enable_bottoming, fn, i, inner_scrolling, len, manual_spacer,
            offset_top, parent_selector, recalc_every, sticky_class;

        // Special arguments
        switch (opts) {
        case 'destroy':
            return this.trigger("sticky_kit:detach");
        case 'reload':
            return this.trigger('stacky_kit:reload');
        default:
            break;
        }

        if (opts == null) {
            opts = {};
        }
        win = opts.container || $window;
        sticky_class = opts.sticky_class, inner_scrolling = opts.inner_scrolling, recalc_every = opts.recalc_every, parent_selector = opts.parent, offset_top = opts.offset_top, manual_spacer = opts.spacer, enable_bottoming = opts.bottoming;
        if (offset_top == null) {
            offset_top = 0;
        }
        if (parent_selector == null) {
            parent_selector = void 0;
        }
        if (inner_scrolling == null) {
            inner_scrolling = true;
        }
        if (sticky_class == null) {
            sticky_class = "is_stuck";
        }
        if (enable_bottoming == null) {
            enable_bottoming = true;
        }
        fn = function(elm, padding_bottom, parent_top, parent_height, top, height, el_float, detached) {
            var bottomed, detach, fixed, last_pos, containerHeight, offset,
                parent, recalc, recalc_and_tick, recalc_counter, spacer, tick;

            if (elm.data("sticky_kit")) {
                return;
            }
            elm.data("sticky_kit", true);
            containerHeight = win.height();
            parent = elm.parent();
            if (parent_selector != null) {
                parent = parent.closest(parent_selector);
            }
            if (!parent.length) {
                throw "failed to find stick parent";
            }
            fixed = false;
            bottomed = false;
            spacer = manual_spacer != null ? manual_spacer && elm.closest(manual_spacer) : $("<div />");
            if (spacer) {
                spacer.css('position', elm.css('position'));
            }

            /**
             *
             * @returns {*}
             */
            recalc = function() {
                var border_top, padding_top, restore;
                if (detached) {
                    return;
                }
                containerHeight = win.height();
                border_top = parseInt(parent.css("border-top-width"), 10);
                padding_top = parseInt(parent.css("padding-top"), 10);
                padding_bottom = parseInt(parent.css("padding-bottom"), 10);
                parent_top = parent.position().top + border_top + padding_top;
                parent_height = parent.height();
                if (fixed) {
                    fixed = false;
                    bottomed = false;
                    if (manual_spacer == null) {
                        elm.insertAfter(spacer);
                        spacer.detach();
                    }
                    elm.css({
                        position: "",
                        top: "",
                        width: "",
                        bottom: ""
                    }).removeClass(sticky_class);
                    restore = true;
                }

                top = elm.position().top - (parseInt(elm.css("margin-top"), 10) || 0) - offset_top;

                height = elm.outerHeight(true);
                el_float = elm.css("float");
                if (spacer) {
                    spacer.css({
                        width: elm.outerWidth(true),
                        height: height,
                        display: elm.css("display"),
                        "vertical-align": elm.css("vertical-align"),
                        "float": el_float
                    });
                }
                if (restore) {
                    return tick();
                }
            };
            recalc();
            if (height === parent_height) {
                return;
            }
            last_pos = void 0;
            offset = offset_top;
            recalc_counter = recalc_every;

            /**
             *
             * @returns {*}
             */
            tick = function() {
                var css, delta, recalced, scroll, will_bottom, win_height;
                if (detached) {
                    return;
                }
                recalced = false;
                if (recalc_counter != null) {
                    recalc_counter -= 1;
                    if (recalc_counter <= 0) {
                        recalc_counter = recalc_every;
                        recalc();
                        recalced = true;
                    }
                }
                if (!recalced && win.height() !== containerHeight) {
                    recalc();
                    recalced = true;
                }
                scroll = win.scrollTop();
                if (last_pos != null) {
                    delta = scroll - last_pos;
                }
                last_pos = scroll;
                if (fixed) {
                    if (enable_bottoming) {
                        will_bottom = scroll + height + offset > parent_height + parent_top;
                        if (bottomed && !will_bottom) {
                            bottomed = false;
                            elm.css({
                                position: "absolute",
                                bottom: "",
                                top: offset
                            }).trigger("sticky_kit:unbottom");
                            parent.css('position', 'static'); //
                        }
                    }
                    if (scroll < top) {
                        fixed = false;
                        offset = offset_top;
                        if (manual_spacer == null) {
                            if (el_float === "left" || el_float === "right") {
                                elm.insertAfter(spacer);
                            }
                            spacer.detach();
                        }
                        css = {
                            position: "",
                            width: "",
                            top: ""
                        };
                        elm.css(css).removeClass(sticky_class).trigger("sticky_kit:unstick");
                    }
                    if (inner_scrolling) {
                        win_height = win.height();
                        if (height + offset_top > win_height) {
                            if (!bottomed) {
                                offset -= delta;
                                offset = Math.max(win_height - height, offset);
                                offset = Math.min(offset_top, offset);
                                if (fixed) {
                                    elm.css({
                                        top: offset + "px"
                                    });
                                }
                            }
                        }
                    }
                } else {
                    if (scroll > top) {
                        fixed = true;
                        css = {
                            position: "absolute",
                            top: offset
                        };
                        css.width = elm.css("box-sizing") === "border-box" ? elm.outerWidth() + "px" : elm.width() + "px";
                        elm.css(css).addClass(sticky_class);
                        if (manual_spacer == null) {
                            elm.after(spacer);
                            if (el_float === "left" || el_float === "right") {
                                spacer.append(elm);
                            }
                        }
                        elm.trigger("sticky_kit:stick");
                    }
                }
                if (fixed && enable_bottoming) {
                    if (will_bottom == null) {
                        will_bottom = scroll + height + offset > parent_height + parent_top;
                    }
                    if (!bottomed && will_bottom) {
                        bottomed = true;
                        if (parent.css("position") === "static") {
                            parent.css({
                                position: "relative"
                            });
                        }
                        elm.css({
                            position: "absolute",
                            bottom: padding_bottom,
                            top: "auto"
                        }).trigger("sticky_kit:bottom");
                    }
                }
                return elm;
            };

            /**
             *
             * @returns {*}
             */
            recalc_and_tick = function() {
                recalc();
                return tick();
            };

            /**
             *
             * @returns {*}
             */
            detach = function() {
                detached = true;
                win.off("touchmove", throttledTick);
                win.off("scroll", throttledTick);
                $window.off("resize", reload);
                $(document.body).off("sticky_kit:recalc", throttledRecalc);
                elm.off("stacky_kit:reload", reload);
                elm.off("sticky_kit:detach", detach);
                elm.removeData("sticky_kit");
                elm.css({
                    position: "",
                    bottom: "",
                    top: "",
                    width: ""
                });
                parent.css("position", "");
                if (fixed) {
                    if (manual_spacer == null) {
                        if (el_float === "left" || el_float === "right") {
                            elm.insertAfter(spacer);
                        }
                        spacer.remove();
                    }
                    return elm.removeClass(sticky_class);
                }
            };
            var throttledTick = _.throttle(tick, 50),
                throttledRecalc = _.debounce(recalc_and_tick, 200);
            win.on("touchmove", throttledTick);
            win.on("scroll", throttledTick);
            $window.on("resize", reload);
            $(document.body).on("sticky_kit:recalc", throttledRecalc);
            elm.on("stacky_kit:reload", reload);
            elm.on("sticky_kit:detach", detach);
            return setTimeout(tick, 0);
        };

        var self = this,
            reload = _.debounce(function() {
                var top = win.scrollTop() || 0;
                win.scrollTop(0);
                setTimeout(function() {
                    self.trigger('sticky_kit:detach');
                    setTimeout(function() {
                        self.stackyKit(opts);
                        setTimeout(function() {
                            win.scrollTop(top);
                        });
                    }, 0);
                }, 0);
            }, 200);

        for (i = 0, len = this.length; i < len; i++) {
            elm = this[i];
            fn($(elm));
        }
        return this;
    };

}).call(window);
