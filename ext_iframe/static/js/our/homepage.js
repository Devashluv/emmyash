var Homepage = function() {
    var reordering;
    var stop_streamer_updates = false; // set this to true to stop avgprice_handler()

    var handleHomepage = function() {

        $('.nav-tabs a').click(function() {
            // empty all tabs, so we don't keep all data+charts for the hidden tabs
            $('#top').html('');
            $('#starred').html('');
            $('#portfolio').html('');
            $('#movers').html('');
            $('#custom').html('');
            // show loader
            var tab = $(this).attr('href').replace('#', '');
            $('#' + tab).html('<div class="mt-4 mb-3" style="font-size: 24px;"><i class="fas fa-spinner fa-spin"></i> ' + _t("Loading...") + '</div>');
            stop_streamer_updates = true;
            // load
            $('#' + tab).load(i18n.normalizeURL('/home_tab_load?tab=' + tab), function() {
                setTimeout(drawSmallCharts, 100); // make sure small charts are drawn later
                stop_streamer_updates = false;
                try {
                    Trade.reinitButtonHandlers();
                } catch (e) {
                    console.log(e);
                }
            });
            // save preference
            $.ajax({
                type: 'POST',
                url: '/stars',
                data: 'tab=' + tab,
                dataType: 'json'
            });
        });

    }

    return {
        init: function() {
            Highcharts.setOptions({
                global: {
                    useUTC: false
                }
            });
            handleHomepage();
        },

        initFilters: function() {
            // Un-disable form fields when page loads, in case they click back after submission
            $('form#filters').find(':input').prop('disabled', false);
        },

        setFilters: function() {
            // include all selected fields in one parameter
            var arr = [];
            $('form#filters input:checked[name=field]').each(function() {
                arr.push($(this).val());
                $(this).attr('disabled', 'disabled');
            });
            $('form#filters input[name=fields]').val(arr.join('-'));

            // disable empty fields so they won't go into the query string
            $('form#filters').find(':input').filter(function() {
                return !this.value;
            }).attr('disabled', 'disabled');

            if (window.location.pathname == '/') {
                Homepage.saveCustomSearch();
                return false;
            } else {
                return true;
            }
        },

        handleStarredSearch: function() {
            // only keep coins
            var data = [];
            for (var i = 0; i < coin_search_options.source.length; i++) {
                item = coin_search_options.source[i];
                if (item.symbol != '') {
                    data.push(item);
                }
            }
            coin_search_options.source = data;
            coin_search_options.afterSelect = function(item) {
                Generic.add_star(item.id);
                $('#starred-search-form i.fa-search').removeClass('fa-search').addClass('fa-spin fa-sync');
            };
            $('#starred_search').typeahead(coin_search_options);
            $('#starred-search-form .input-group').css('left', '');
        },

        changePeriod: function(pref_period) {
            var btn = 'button.ch-period';
            var html = $(btn).html();
            $(btn).attr('disabled', 'disabled');
            $(btn).html('<i class="fal fa-spin fa-spinner"></i>');
            stop_streamer_updates = true;

            $.ajax({
                type: 'POST',
                url: i18n.normalizeURL('/pref_period_save'),
                data: 'pref_period=' + pref_period,
                dataType: 'json'
            }).done(function(data) {
                if ($('#top').length) {
                    // if in home make sure active tab is reloaded
                    var tab = $('ul.nav.nav-tabs a.active').attr('href').substr(1);
                    $('#' + tab).load(i18n.normalizeURL('/home_tab_load?tab=' + tab), function() {
                        setTimeout(drawSmallCharts, 100); // make sure small charts are drawn later
                        stop_streamer_updates = false;
                    });
                } else {
                    location.reload(true);
                }
            }).fail(function($xhr) {
                var data = $xhr.responseJSON;
                alertErr('.container:has(table.coinlist)', data.error);
                $(btn).removeAttr('disabled');
                $(btn).html(html);
                stop_streamer_updates = false;
            });
            return false;
        },

        setOrder: function(pref_order) {
            if (reordering == true) {
                return false;
            }
            reordering = true;
            stop_streamer_updates = true;
            var cur_order = (pref_order == 'marketcap' ? 'volume' : 'marketcap');
            var sel = 'table.coinlist th i.order-' + pref_order;
            var sel2 = '.coinlist-footer-controls a.order';
            $(sel).removeClass('fa-angle-double-down');
            $(sel).addClass('fa-spin fa-spinner');
            $(sel).css('color', '#333');
            $(sel2).append(' <i class="fal fa-spin fa-spinner"></i>');

            $.ajax({
                type: 'POST',
                url: '/pref_order_save',
                data: 'pref_order=' + pref_order,
                dataType: 'json'
            }).done(function(data) {
                if ($('#top').length) {
                    // if in home make sure active tab is reloaded
                    var tab = $('ul.nav.nav-tabs a.active').attr('href').substr(1);
                    $('#' + tab).load(i18n.normalizeURL('/home_tab_load?tab=' + tab), function() {
                        setTimeout(drawSmallCharts, 100); // make sure small charts are drawn later
                        reordering = false;
                        stop_streamer_updates = false;
                    });
                } else {
                    location.reload(true);
                }
            }).fail(function($xhr) {
                var data = $xhr.responseJSON;
                alertErr('.container:has(table.coinlist)', data.error);
                $(sel).removeClass('fa-spin fa-spinner');
                $(sel).addClass('fa-angle-double-down');
                $(sel2 + ' i').remove();
                reordering = false;
                stop_streamer_updates = false;
            });
            return false;
        },

        refreshTopBoxes: function(total_market_cap, btc_market_cap, total_volume) {
            // mcap
            update_value(Generic.selector.get('.top_b_mcap a'),
                format_large_number(total_market_cap), true, false);

            // btc
            if (total_market_cap > 0) {
                update_value(Generic.selector.get('.top_b_btc a'),
                    (btc_market_cap / total_market_cap * 100).toFixed(2) + '%', true, false);
            }
            update_value(Generic.selector.get('.top_b_btc .stat-note'),
                'BTC: ' + Settings.prefShortSymbol + format_large_number(btc_market_cap), false, false);

            // vol
            update_value(Generic.selector.get('.top_b_vol a'),
                format_large_number(total_volume), true, false);
        },

        toggleFilters: function() {
            if ($('#filters').is(':visible')) {
                $('#filters').parent().addClass('d-none');
                $('#filters-btn').html(_t('Show'));
            } else {
                $('#filters').parent().removeClass('d-none');
                $('#filters-btn').html(_t('Hide'));
            }
        },

        copyURL: function(el) {
            var textArea = document.createElement('textarea');
            textArea.style.position = 'fixed';
            textArea.style.top = 0;
            textArea.style.left = 0;
            textArea.style.width = '2em';
            textArea.style.height = '2em';
            textArea.style.padding = 0;
            textArea.style.border = 'none';
            textArea.style.outline = 'none';
            textArea.style.boxShadow = 'none';
            textArea.style.background = 'transparent';
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            $(el).removeClass('btn-secondary').addClass('btn-success').html('Link copied');
        },

        saveCustomSearch: function() {
            Generic.blockUI();
            stop_streamer_updates = true;
            $.ajax({
                type: 'POST',
                url: '/custom_tab_search_save',
                data: $('form#filters').serialize(),
                dataType: 'json'
            }).done(function(data) {
                $('#custom').load(i18n.normalizeURL('/home_tab_load?tab=custom'), function() {
                    Homepage.initFilters();
                    window.scrollTo(0, 0);
                    Generic.unblockUI();
                    stop_streamer_updates = false;
                    setTimeout(drawSmallCharts, 1000); // make sure small charts are drawn later (needs a bit more time here)
                });
            }).fail(function($xhr) {
                Generic.unblockUI();
                var data = $xhr.responseJSON;
                alertErr('#custom', data.error);
                stop_streamer_updates = false;
            });
            return false;
        }

    };
}();

Homepage.avgprice_handler = function(from_coin_id, price, delta, pref_coin_id, total_volume24f,
    total_volume, from_to_pref_rate, marketcap) {
    if (Homepage.stop_streamer_updates) return;
    update_value(Generic.selector.get('.avgprice-' + from_coin_id), Settings.prefShortSymbol + format_price(price), true, false);
    update_value(Generic.selector.get('.avgprice-' + from_coin_id + '-' + pref_coin_id), get_short_symbol(pref_coin_id) + ' ' +
        format_price(price * from_to_pref_rate), true, false);
    if (delta >= 0) {
        Generic.selector.get('.delta-' + from_coin_id).addClass('up').removeClass('down');
        delta = '+' + parseFloat(delta).toFixed(2);
    } else {
        Generic.selector.get('.delta-' + from_coin_id).removeClass('up').addClass('down');
        delta = parseFloat(delta).toFixed(2);
    }
    if (delta.indexOf('null') == -1) {
        update_value(Generic.selector.get('.delta-' + from_coin_id), delta + '%', false, false);
    }
    update_value(Generic.selector.get('.volume-' + from_coin_id), Settings.prefShortSymbol + format_large_number(total_volume), false, false);
    update_value(Generic.selector.get('.volume24f-' + from_coin_id), get_short_symbol(from_coin_id) + ' ' + format_large_number(total_volume24f), false, false);
    update_value(Generic.selector.get('.marketcap-' + from_coin_id), Settings.prefShortSymbol + format_large_number(marketcap), false, false);
}

Homepage.delta_handler = function(fld, delta) {
    if (delta >= 0) {
        Generic.selector.get(fld).addClass('up').removeClass('down');
        if (delta > 1) {
            delta = '+' + format_price(delta);
        } else {
            delta = '+' + delta;
        }
    } else {
        Generic.selector.get(fld).removeClass('up').addClass('down');
        if (delta < -1) {
            delta = format_price(delta);
        }
    }
    if (delta.indexOf('null') == -1) {
        update_value(Generic.selector.get(fld), delta + '%', false, false);
    }
}

Homepage.avgprice_handler_coins = function(from_coin_id, price, marketcap,
    total_volume1t, total_volume24t, total_volume7t, total_volume30t,
    delta1pct, delta24pct, delta7pct, delta30pct) {
    if (Homepage.stop_streamer_updates) return;
    update_value(Generic.selector.get('.avgprice-' + from_coin_id), Settings.prefShortSymbol + format_price(price), true, false);
    update_value(Generic.selector.get('.marketcap-' + from_coin_id), Settings.prefShortSymbol + format_large_number(marketcap), false, false);
    update_value(Generic.selector.get('.volume1-' + from_coin_id), Settings.prefShortSymbol + format_large_number(total_volume1t), false, false);
    update_value(Generic.selector.get('.volume24-' + from_coin_id), Settings.prefShortSymbol + format_large_number(total_volume24t), false, false);
    update_value(Generic.selector.get('.volume7-' + from_coin_id), Settings.prefShortSymbol + format_large_number(total_volume7t), false, false);
    update_value(Generic.selector.get('.volume30-' + from_coin_id), Settings.prefShortSymbol + format_large_number(total_volume30t), false, false);
    Homepage.delta_handler('.delta1-' + from_coin_id, delta1pct);
    Homepage.delta_handler('.delta24-' + from_coin_id, delta24pct);
    Homepage.delta_handler('.delta7-' + from_coin_id, delta7pct);
    Homepage.delta_handler('.delta30-' + from_coin_id, delta30pct);
}