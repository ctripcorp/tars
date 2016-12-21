@charset 'utf-8';
/*************************************************!
*
*   project:    liteAccordion - a horizontal accordion plugin for jQuery
*   author:     Nicola Hibbert
*   url:        http://nicolahibbert.com/liteaccordion-v2/
*   demo:       http://www.nicolahibbert.com/demo/liteAccordion/
*
*   Version:    2.2.0
*   Copyright:  (c) 2010-2013 Nicola Hibbert
*   Licence:    MIT
*
**************************************************/
/****************************************** Core */
.liteAccordion {
    text-align: left;
    font-size: 16px;
    line-height: 24px;
    font: 'Helvetica Neue', Verdana, Arial, sans-serif;
    -webkit-backface-visibility: hidden;
    -webkit-perspective: 1000;
    -webkit-tap-highlight-color: transparent;
}
.liteAccordion, .liteAccordion * { padding: 0; margin: 0; border: 0; box-sizing: content-box }
.liteAccordion > ol { position: relative; overflow: hidden; height: 100%; margin: 0; padding: 0; list-style-type: none }
.liteAccordion > ol > li { list-style-type: none }
.liteAccordion .slide > h2 {
    color: black;
    font-size: 16px;
    font-weight: normal;
    margin: 0;
    z-index: 100;
    position: absolute;
    top: 0;
    left: 0;
    -webkit-backface-visibility: hidden; /* fixes chrome bug */
    -webkit-transform: translateX(-100%) rotate(-90deg);
    -webkit-transform-origin: right top;
    -moz-transform: translateX(-100%) rotate(-90deg);
    -moz-transform-origin: right top;
    -o-transform: translateX(-100%) rotate(-90deg);
    -o-transform-origin: right top;
    transform: translateX(-100%) rotate(-90deg);
    transform-origin: right top;
}
.liteAccordion .slide > h2 span {
    display: block;
    padding-right: 8%;
    text-align: right;
    height: 90%;
    margin-top: 5px;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
}
.liteAccordion .slide > h2 b {
    display: inline-block;
    position: absolute;
    top: 13%;
    left: 10%;
    text-align: center;
    -webkit-transform: rotate(90deg);
    -moz-transform: rotate(90deg);
    -o-transform: rotate(90deg);
    transform: rotate(90deg);
}

.liteAccordion .slide > h2:hover { cursor: pointer }
.liteAccordion .slide > div { height: 100%; position: absolute; top: 0; z-index: 10; overflow: hidden; background: white }
.liteAccordion .ap-caption { padding: 10px 15px; position: absolute; bottom: 20px; right: 30px; z-index: 3; background: black;
    background: rgba(0,0,0,0.7); color: white; -webkit-border-radius: 4px; -moz-border-radius: 4px; border-radius: 4px }
.liteAccordion noscript p { padding: 10px; margin: 0; background: white }

/****************************************** Basic */
.liteAccordion.basic .slide > h2 { background: #333; color: white; line-height: 225% }

/****************************************** Dark */
.liteAccordion.dark {
    border: 9px solid #353535;
    border-bottom-width: 8px;
    padding: 5px 5px 6px 0;
    background: #030303;
    -webkit-box-shadow: 0 -1px 0 #5b5b5b inset, 0 5px 15px rgba(0, 0, 0, 0.4);
    -moz-box-shadow: 0 -1px 0 #5b5b5b inset, 0 5px 15px rgba(0, 0, 0, 0.4);
    -ms-box-shadow: 0 -1px 0 #5b5b5b inset, 0 5px 15px rgba(0, 0, 0, 0.4);
    -o-box-shadow: 0 -1px 0 #5b5b5b inset, 0 5px 15px rgba(0, 0, 0, 0.4);
    box-shadow: 0 -1px 0 #5b5b5b inset, 0 5px 15px rgba(0, 0, 0, 0.4);
}
.liteAccordion.dark .slide > h2 { background: #030303; text-shadow: 0 -1px 0 #030303; line-height: 265% }
.liteAccordion.dark .slide > h2 span { background: #353535; color: white }
.liteAccordion.dark .slide > h2 b { background: #353535; color: #030303; text-shadow: -1px 1px 0 #5b5b5b }
.liteAccordion.dark .slide > h2.selected span, .liteAccordion.dark .slide > h2.selected span:hover {
    background: #353535;
    background: -moz-linear-gradient(left,  #353535 0%, #555555 100%);
    background: -webkit-gradient(linear, left top, right top, color-stop(0%,#353535), color-stop(100%,#555555));
    background: -webkit-linear-gradient(left,  #353535 0%,#555555 100%);
    background: -o-linear-gradient(left,  #353535 0%,#555555 100%);
    background: -ms-linear-gradient(left,  #353535 0%,#555555 100%);
    background: linear-gradient(left,  #353535 0%,#555555 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#353535', endColorstr='#555555',GradientType=1 );
}
.liteAccordion.dark .slide > h2.selected b {
    background: #383838;
    background: -moz-linear-gradient(top,  #3a3a3a 0%, #363636 100%);
    background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#3a3a3a), color-stop(100%,#363636));
    background: -webkit-linear-gradient(top,  #3a3a3a 0%,#363636 100%);
    background: -o-linear-gradient(top,  #3a3a3a 0%,#363636 100%);
    background: -ms-linear-gradient(top,  #3a3a3a 0%,#363636 100%);
    background: linear-gradient(top,  #3a3a3a 0%,#363636 100%);
}
.liteAccordion.dark .slide > div { background: #030303; margin-left: 5px }

/***************************************** Light */
.liteAccordion.light {
    border: 9px solid white;
    border-bottom-width: 8px;
    padding: 5px 5px 6px 0;
    background: #a0a0a0;
    -webkit-box-shadow: -1px -1px 0 #c0c0c0, 1px 1px 0 #c0c0c0, 0 5px 15px rgba(0, 0, 0, 0.4);
    -moz-box-shadow: -1px -1px 0 #c0c0c0, 1px 1px 0 #c0c0c0, 0 5px 15px rgba(0, 0, 0, 0.4);
    -ms-box-shadow: -1px -1px 0 #c0c0c0, 1px 1px 0 #c0c0c0, 0 5px 15px rgba(0, 0, 0, 0.4);
    -o-box-shadow: -1px -1px 0 #c0c0c0, 1px 1px 0 #c0c0c0, 0 5px 15px rgba(0, 0, 0, 0.4);
    box-shadow: -1px -1px 0 #c0c0c0, 1px 1px 0 #c0c0c0, 0 5px 15px rgba(0, 0, 0, 0.4);
}
.liteAccordion.light .slide > h2 { background: #a0a0a0; text-shadow: 0 -1px 0 white; line-height: 265% }
.liteAccordion.light .slide > h2 span {
    background: #fcfcfc;
    background: -moz-linear-gradient(left,  #fcfcfc 0%, #ededed 100%);
    background: -webkit-gradient(linear, left top, right top, color-stop(0%,#fcfcfc), color-stop(100%,#ededed));
    background: -webkit-linear-gradient(left,  #fcfcfc 0%,#ededed 100%);
    background: -o-linear-gradient(left,  #fcfcfc 0%,#ededed 100%);
    background: -ms-linear-gradient(left,  #fcfcfc 0%,#ededed 100%);
    background: linear-gradient(left,  #fcfcfc 0%,#ededed 100%);
    filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#fcfcfc', endColorstr='#ededed',GradientType=1 );
    -webkit-box-shadow: -1px -1px 0 #909090 inset, 1px 1px 0 #909090 inset;
    -moz-box-shadow: -1px -1px 0 #909090 inset, 1px 1px 0 #909090 inset;
    -o-box-shadow: -1px -1px 0 #909090 inset, 1px 1px 0 #909090 inset;
    box-shadow: -1px -1px 0 #909090 inset, 1px 1px 0 #909090 inset;
    color: #909090;
}
.liteAccordion.light .slide > h2 b { background: #ffffff; color: #909090; text-shadow: -1px 1px 0 white }
.liteAccordion.light .slide > h2.selected span, .liteAccordion.light .slide h2.selected span:hover, .liteAccordion.light .slide > h2.selected b { background: #ffffff }
.liteAccordion.light .slide > div { background: #a0a0a0; margin-left: 5px }

/**************************************** Stitch */
.liteAccordion.stitch {
    position: relative;
    padding: 5px 0 5px 5px;
    border: 11px solid #353535;
    background: #353535;
    -webkit-box-shadow: 0 -1px 0 #5b5b5b inset, 0 5px 15px rgba(0, 0, 0, 0.4);
    -moz-box-shadow: 0 -1px 0 #5b5b5b inset, 0 5px 15px rgba(0, 0, 0, 0.4);
    -o-box-shadow: 0 -1px 0 #5b5b5b inset, 0 5px 15px rgba(0, 0, 0, 0.4);
    box-shadow: 0 -1px 0 #5b5b5b inset, 0 5px 15px rgba(0, 0, 0, 0.4);
}
.liteAccordion.stitch:before {
    content: '';
    width: 100%;
    height: 100%;
    position: absolute;
    top: -9px;
    left: -9px;
    background: #353535;
    border: 9px solid transparent;
    -webkit-border-image: url('bg_stitch.png') 9 repeat;
    -moz-border-image: url('bg_stitch.png') 9 repeat;
    -o-border-image: url('bg_stitch.png') 9 repeat;
    border-image: url('bg_stitch.png') 9 repeat;
}
.liteAccordion.stitch .slide > h2 { background: #353535 }
.liteAccordion.stitch .slide > h2 span {
    height: auto;
    padding-right: 5%;
    color: white;
    text-shadow: -1px 1px 0 #5b5b5b;
    border: 9px solid transparent;
    background-image: url('bg_noise.png');
    margin-top: 0;
    -webkit-border-image: url('bg_stitch.png') 9 repeat;
    -moz-border-image: url('bg_stitch.png') 9 repeat;
    -o-border-image: url('bg_stitch.png') 9 repeat;
    border-image: url('bg_stitch.png') 9 repeat;
}
.liteAccordion.stitch .slide > h2.selected:after {
    content: '';
    display: block;
    height: 11px;
    width: 11px;
    position: absolute;
    bottom: -3px;
    right: 38px;
    -webkit-transform: rotate(45deg);
    -moz-transform: rotate(45deg);
    -o-transform: rotate(45deg);
    transform: rotate(45deg);
    -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=2)";
    filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=2);
    border: 9px solid transparent;
    border-top: 0;
    border-left: 0;
    -webkit-border-image: url('bg_stitch.png') 9 repeat;
    -moz-border-image: url('bg_stitch.png') 9 repeat;
    -o-border-image: url('bg_stitch.png') 9 repeat;
    border-image: url('bg_stitch.png') 9 repeat;
    background-image: url('bg_noise.png');
}

.liteAccordion.stitch .slide:nth-child(1) > h2 span, .liteAccordion.stitch .slide:nth-child(1) > h2:after { background-color: #c25252 }
.liteAccordion.stitch .slide:nth-child(2) > h2 span, .liteAccordion.stitch .slide:nth-child(2) > h2:after { background-color: #ca9859 }
.liteAccordion.stitch .slide:nth-child(3) > h2 span, .liteAccordion.stitch .slide:nth-child(3) > h2:after { background-color: #96ba5f }
.liteAccordion.stitch .slide:nth-child(4) > h2 span, .liteAccordion.stitch .slide:nth-child(4) > h2:after { background-color: #59abb7 }
.liteAccordion.stitch .slide:nth-child(5) > h2 span, .liteAccordion.stitch .slide:nth-child(5) > h2:after { background-color: #bb6098 }
.liteAccordion.stitch .slide > h2 b { top: 19%; color: white; text-shadow: 1px 1px 0 #5b5b5b }
.liteAccordion.stitch .slide > div { margin-right: 6px }
.liteAccordion.stitch.rounded > ol { -webkit-border-radius: 0; -moz-border-radius: 0; -ms-border-radius: 0; border-radius: 0 }

/*************************************** Rounded */
.liteAccordion.rounded, .rounded > ol { -webkit-border-radius: 6px; -moz-border-radius: 6px; -ms-border-radius: 6px; border-radius: 6px }
.liteAccordion.rounded .slide > h2 span { -webkit-border-radius: 4px; -moz-border-radius: 4px; -ms-border-radius: 4px; border-radius: 4px }

/******************************************** IE */
/* stitch */
.liteAccordion.ie.stitch .slide > h2 { /*line-height: 265%*/ }
.liteAccordion.ie.stitch .slide > h2 span { /*height: 89%; padding-right: 8%*/ }
.liteAccordion.ie.stitch .slide > h2.selected:after { display: none }
.liteAccordion.ie.stitch .slide-0 > h2 span { background-color: #c25252 }
.liteAccordion.ie.stitch .slide-1 > h2 span { background-color: #ca9859 }
.liteAccordion.ie.stitch .slide-2 > h2 span { background-color: #96ba5f }
.liteAccordion.ie.stitch .slide-3 > h2 span { background-color: #59abb7 }
.liteAccordion.ie.stitch .slide-4 > h2 span { background-color: #bb6098 }
.liteAccordion.ie.stitch .slide-5 > h2 span { background-color: #c25252 }
.liteAccordion.ie.stitch .slide-6 > h2 span { background-color: #ca9859 }
.liteAccordion.ie.stitch .slide-7 > h2 span { background-color: #96ba5f }
.liteAccordion.ie.stitch .slide-8 > h2 span { background-color: #59abb7 }
.liteAccordion.ie.stitch .slide-9 > h2 span { background-color: #bb6098 }

/* transforms */
.liteAccordion.ie .slide > h2,
.liteAccordion.ie .slide > h2 span,
.liteAccordion.ie .slide > h2 b { filter: none; -ms-filter: none; -ms-transform: none }
.liteAccordion.ie7 .slide > h2 { filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=3) }
.liteAccordion.ie7 .slide > h2 b { filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=1) }
.liteAccordion.ie8 .slide > h2 { -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=3)" }
.liteAccordion.ie8 .slide > h2 b { -ms-filter: "progid:DXImageTransform.Microsoft.BasicImage(rotation=1)" }
.liteAccordion.ie9 .slide > h2 { -ms-transform: translateX(-100%) rotate(-90deg); -ms-transform-origin: right top }
.liteAccordion.ie9 .slide > h2 b { -ms-transform: rotate(90deg) }

/* misc */
.liteAccordion.ie7 .slide > h2 b, .liteAccordion.ie8 .slide > h2 b { top: 44%; left: 5% }
.liteAccordion.ie7.stitch .slide > h2 b, .liteAccordion.ie8.stitch .slide > h2 b { top: 36% }
.liteAccordion.ie9.stitch { box-shadow: 0 5px 15px rgba(0, 0, 0, 0.4) }