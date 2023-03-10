var Account = function() {

    var handleLogin = function() {

        $('#login-form').validate({
            errorClass: 'help-block',
            rules: {
                username: {
                    required: true
                },
                password: {
                    required: true
                }
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },
            submitHandler: function(form) {
                Generic.blockUI('#login-form-container');
                $.ajax({
                    type: 'POST',
                    url: '/login',
                    data: $('#login-form').serialize(),
                    dataType: 'json'
                }).done(function(data) {
                    if (data.redirect != undefined) {
                        window.location.replace(data.redirect);
                    } else if (Generic.jsCookies.hasItem('MOBILE_APP')) {
                        window.location.replace('/?justloggedin');
                    } else {
                        location.reload(true);
                    }
                }).fail(function($xhr) {
                    var data = $xhr.responseJSON;
                    alertErr('#login-form', data.error);
                    Generic.unblockUI('#login-form-container');
                });
            }
        });

        $('#login-form input').keypress(function(e) {
            if (e.which == 13) {
                if ($('#login-form').validate().form()) {
                    $('#login-form').submit();
                }
                return false;
            }
        });

    }

    var handleRemind = function() {

        $('#remind-form').validate({
            errorClass: 'help-block',
            rules: {
                email: {
                    required: true
                }
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },
            submitHandler: function(form) {
                Generic.blockUI('#remind-form-container');
                $.ajax({
                    type: 'POST',
                    url: '/remind',
                    data: $('#remind-form').serialize(),
                    dataType: 'json'
                }).done(function(data) {
                    alertMsg('#remind-form', data.msg);
                }).fail(function() {
                    alertErr('#remind-form', _t('Some unexpected error occurred. Please try later.'));
                }).always(function() {
                    Generic.unblockUI('#remind-form-container');
                });
            }
        });

        $('#remind-form input').keypress(function(e) {
            if (e.which == 13) {
                if ($('#remind-form').validate().form()) {
                    $('#remind-form').submit();
                }
                return false;
            }
        });

    }

    var handleVerification = function() {
        $('#send_email_verification').click(function() {
            var elem = $(this);
            $.ajax({
                type: 'POST',
                url: '/send_email_verification',
                data: 'username=' + $("#username_to_verify").val(),
                dataType: 'json'
            }).done(function(data) {
                alertMsg('#email_verification_t', _t('e-mail sent'));
            }).fail(function($xhr) {
                var data = $xhr.responseJSON;
                alertErr('#email_verification_t', data.error);
            });
        });
    }

    var handleRegister = function() {

        $('#register-form').validate({
            errorClass: 'help-block',
            rules: {
                username: {
                    required: true
                },
                email: {
                    required: true,
                    email: true
                },
                password: {
                    required: true
                },
                accept_terms: {
                    required: true
                }
            },
            messages: {
                accept_terms: _t('You must read and accept our Terms and Privacy policy.')
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },
            submitHandler: function(form) {
                Generic.blockUI('#register-form-container');
                $.ajax({
                    type: 'POST',
                    url: '/register',
                    data: $('#register-form').serialize(),
                    dataType: 'json'
                }).done(function(data) {
                    if (data.redirect != undefined) {
                        window.location.replace(data.redirect);
                    } else if (Generic.jsCookies.hasItem('MOBILE_APP')) {
                        window.location.replace('/?justloggedin');
                    } else {
                        location.reload(true);
                    }
                }).fail(function($xhr) {
                    var data = $xhr.responseJSON;
                    alertErr('#register-form', data.error);
                    Generic.unblockUI('#register-form-container');
                });
            }
        });
    };

    var handleRegisterUsername = function() {

        $('#register-username-form').validate({
            errorClass: 'help-block',
            rules: {
                username: {
                    required: true
                },
                accept_terms: {
                    required: true
                }
            },
            messages: {
                accept_terms: _t('You must read and accept our Terms and Privacy policy.')
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },
            submitHandler: function(form) {
                Generic.blockUI('#register-usename-form-container');
                $.ajax({
                    type: 'POST',
                    url: '/register',
                    data: $('#register-username-form').serialize(),
                    dataType: 'json'
                }).done(function(data) {
                    window.location.replace('/');
                }).fail(function($xhr) {
                    var data = $xhr.responseJSON;
                    alertErr('#register-username-form', data.error);
                    Generic.unblockUI('#register-usename-form-container');
                });
            }
        });

        $('#register-username-form input').keypress(function(e) {
            if (e.which == 13) {
                if ($('#register-username-form').validate().form()) {
                    $('#register-username-form').submit();
                }
                return false;
            }
        });
    }

    var handleProfile = function() {

        $('#profile-form').validate({
            errorClass: 'help-block',
            rules: {
                email: {
                    required: true,
                    email: true
                }
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },
            submitHandler: function(form) {
                Generic.blockUI();
                $.ajax({
                    type: 'POST',
                    url: i18n.normalizeURL('/profile_save'),
                    data: $('#profile-form').serialize(),
                    dataType: 'json'
                }).done(function(data) {
                    alertMsg('#profile-form', data.msg);
                }).fail(function($xhr) {
                    var data = $xhr.responseJSON;
                    alertErr('#profile-form', data.error);
                }).always(function() {
                    Generic.unblockUI();
                });
            }
        });

        $('#profile-form input').keypress(function(e) {
            if (e.which == 13) {
                if ($('#profile-form').validate().form()) {
                    $('#profile-form').submit();
                }
                return false;
            }
        });

        $('#delete-profile-form').validate({
            errorClass: 'help-block',
            rules: {
                password_to_del_account: {
                    required: true
                }
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },
            submitHandler: function(form) {
                Generic.blockUI();
                $.ajax({
                    type: 'POST',
                    url: i18n.normalizeURL('/profile_delete'),
                    data: $('#delete-profile-form').serialize(),
                    dataType: 'json'
                }).done(function(data) {
                    alertMsg('#delete-profile-form', data.msg);
                    top.location.href = i18n.normalizeURL('/');
                }).fail(function($xhr) {
                    var data = $xhr.responseJSON;
                    alertErr('#delete-profile-form', data.error);
                }).always(function() {
                    Generic.unblockUI();
                });
            }
        });

        $('#delete-profile-form input').keypress(function(e) {
            if (e.which == 13) {
                return false;
            }
        });

        $('#api-usage-form').validate({
            errorClass: 'help-block',
            rules: {
                description: {
                    required: true
                }
            },
            highlight: function(element) {
                $(element).closest('.form-group').addClass('has-error');
            },
            success: function(label) {
                label.closest('.form-group').removeClass('has-error');
                label.remove();
            },
            submitHandler: function(form) {
                Generic.blockUI();
                $.ajax({
                    type: 'POST',
                    url: '/api/create_key',
                    data: $('#api-usage-form').serialize(),
                    dataType: 'json'
                }).done(function(data) {
                    alertMsg('#api-usage-form', data.msg);
                    location.reload(true);
                }).fail(function($xhr) {
                    var data = $xhr.responseJSON;
                    alertErr('#api-usage-form', data.error);
                }).always(function() {
                    Generic.unblockUI();
                });
            }
        });
    }

    return {
        showRegisterUsernameForm: function() {
            $('#modal_account .modal-content').hide();
            $('#register-username-form-container').show();
            $('#modal_account').modal('show');
        },

        init: function() {
            handleLogin();
            handleRemind();
            handleVerification();
            handleRegister();
            handleRegisterUsername();
            handleProfile();
            Account.initButtonHandlers();
        },

        initButtonHandlers: function() {
            $('.login-register').click(function() {
                $('#modal_account .modal-content').hide();
                $('#login-form-container').show();
                $('#modal_account').modal('show');
                return false;
            });

            $('.register-login').click(function() {
                $('#modal_account .modal-content').hide();
                $('#register-form-container').show();
                $('#modal_account').modal('show');
                return false;
            });

            $('.personalized-intro').click(function() {
                $('#modal_account .modal-content').hide();
                $('#personalized-intro-container').show();
                $('#modal_account').modal('show');
                return false;
            });

            $('.register-btn').click(function() {
                $('#modal_account .modal-content').hide();
                $('#register-form-container').show();
            });

            $('.login-btn').click(function() {
                $('#modal_account .modal-content').hide();
                $('#login-form-container').show();
            });

            $('.forget-password').click(function() {
                $('#modal_account .modal-content').hide();
                $('#remind-form-container').show();
            });
        }
    };
}();