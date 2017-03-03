/*
	common.js
	Copyright 2001-2017 by Christopher Heng. All rights reserved.
	https://www.thesitewizard.com/
*/

function tsw_init_page_global()
{
	framebreaker();
}
function framebreaker()
{	// see https://www.thesitewizard.com/archive/framebreak.shtml
	// for an explanation of this script and how to use it on your own site
	if (top.location != location) {
		top.location.href = document.location.href ;
	}
}
function tsw_set_cookie ( cookie_name, cookie_value, lifespan_in_days, valid_domain )
{
  // https://www.thesitewizard.com/javascripts/cookies.shtml
  var domain_string = valid_domain ? ("; domain=" + valid_domain) : '' ;
  document.cookie = cookie_name + "=" + encodeURIComponent( cookie_value ) +
      "; max-age=" + 60 * 60 * 24 * lifespan_in_days +
      "; path=/" + domain_string ;
}
function tsw_is_unsupported_browser ()
{
	return (navigator.appName == "Microsoft Internet Explorer") ? /MSIE [6-8]/.test( navigator.appVersion ) : false ;
}
function tsw_show_notice ( show )
{
	var msg = 'This site uses cookies. \
<a href="https://www.thesitewizard.com/privacy.shtml" id="cookiepolicylink" title="Read details" target="_top">Details</a> \
<a id="cookienoticebutton" href="#void" onclick="tsw_close_clicked();" title="Do not show this message">&nbsp;&nbsp;Close&nbsp;&nbsp;</a>' ;
	var cookien = 'user_wants_notice_gone' ;
	var cookien_value = 'y' ;
	var id_notice = 'cookienotice' ;
	var notif ;
	if (show) {
		if ((typeof tsw_show_notice.shown == 'undefined') || !tsw_show_notice.shown) {
			if (document.cookie.indexOf(cookien) == -1) {
				notif = document.createElement('div');
				notif.id = id_notice ;
				notif.innerHTML = msg ;
				document.body.appendChild(notif);
				tsw_show_notice.shown = true ;
			}
		}
	}
	else {
		if ((typeof tsw_show_notice.shown != 'undefined') && tsw_show_notice.shown) {
			notif = document.getElementById( id_notice );
			notif.parentNode.removeChild(notif);
			tsw_set_cookie( cookien, cookien_value, 365, 'thesitewizard.com' );
			tsw_show_notice.shown = false ;
		}
	}
}
function tsw_notify_user ()
{
	if (typeof tsw_notify_user.done == 'undefined' || !tsw_notify_user.done) {
		tsw_notify_user.done = true ;
		if (!tsw_is_unsupported_browser())
			tsw_show_notice( true );
	}
}
function tsw_close_clicked ()
{
	tsw_show_notice ( false );
	return false ;
}
