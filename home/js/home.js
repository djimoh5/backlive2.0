var Home = {
    init: function() {
        Home.adjustHeaderHeight();
        
        $(window).resize(function() {
            Home.adjustHeaderHeight();
        });
        
        $('#invite input, #invite textarea').keyup(function(e) { Home.enterCapture('.btn-req-invite', e) });
        $('#txt_uname').keyup(function(e) { Home.enterCapture('.btn-login', e) });
        $('#txt_pword').keyup(function(e) { Home.enterCapture('.btn-login', e) });
        $('#txt_reg_uname').keyup(function(e) { Home.enterCapture('.btn-register', e) });
        $('#txt_reg_pword').keyup(function(e) { Home.enterCapture('.btn-register', e) });
        $('#txt_reg_email').keyup(function(e) { Home.enterCapture('.btn-register', e) });
        
        $('.btn-signin').click(function() {
            if($('.sign-in-menu').is(':visible'))
                $(this).parent().removeClass('open');
            else
                $(this).parent().addClass('open');
            
            $('.btn-show-register').parent().removeClass('open');
            $('#txt_uname').focus();
        });
        $('.btn-show-register').click(function() {
            if($('.register-menu').is(':visible'))
                $(this).parent().removeClass('open');
            else
                $(this).parent().addClass('open');
            
            $('.btn-signin').parent().removeClass('open');
            $('#txt_reg_uname').focus();
        });
        $('.dropdown-menu .login-form').click(function(e) {
            e.stopPropagation();
        });
        
        //load chart
        var data = [];
        Home.api({ years:1 }, 'ticker/SP500/prices', function(results) {
            var yMin, yMax;
            
            for(var i = 0, cnt = results.length; i < cnt; i++) {
                var price = results[i].adjClose;
                data.push([parseDate(results[i].date, 3).getTime(), price]);
                
               if(!yMin || price < yMin)
    				yMin = price;                                      
                else if(!yMax || price > yMax)
                    yMax = price;
            }
            
			Home.initChart(data, yMin, yMax);
		});
		
		$('#video_modal').on('hide.bs.modal', function (e) {
            $('#video_modal .modal-content').empty();
        });
    },
    
    showRegister: function() {
        $('.btn-show-register').click();
        window.location.href = '#index';
        $('#pricing .exit-invite a').click();
    },
    
    adjustHeaderHeight: function() {
        var winHeight = $(window).height();
        $('.header').height(winHeight - 80);
        
        var minMargin = 60, ssHeight = 300, introHeight = 554, imgAdj;
        var marginTop = winHeight - (introHeight + 93);
        
        if(marginTop >= minMargin) {
            imgAdj = 0;
            
            if(marginTop > 200) //really large screen so just center
                marginTop = Math.max(minMargin, ((winHeight - introHeight) / 2) - 93);
        }
        else {
            imgAdj = minMargin - marginTop;
            marginTop = minMargin;
        }

        $('.intro-text').css('margin-top', marginTop);
        $('.screenshot-container .inner').css('height', ssHeight - imgAdj);
        $('.screenshot-container .middle .inner').css('height', ssHeight + 70 - imgAdj);
        $('.screenshot-container .middle .inner .overlay').css('line-height', (ssHeight + 70 - imgAdj) + 'px');
    },
    
    login: function() {
        $('.sign-in-menu .error-msg').hide();
        
        Home.api({ username:$('#txt_uname').val(), password:$('#txt_pword').val() }, 'user/login', function(res) {
            //console.log(res);
            
            if(res.error)
                $('.sign-in-menu .error-msg').show().html('username or password incorrect');
            else 
                Home.loginSuccess(res);
        }, true);
    },
    
    register: function() {
        if($('.accept-terms input[type="checkbox"]').is(':checked')) {
            $('.register-menu .error-msg').hide();
            var uname = Home.formValue('#txt_reg_uname', 'must be greater than 4 chars');
            var email = Home.emailValue('#txt_reg_email');
            var pword = Home.formValue('#txt_reg_pword', 'must be greater than 4 chars');
            
            if(uname != null && email != null && pword != null) {
                Home.api({ username:uname, password:pword, email:email }, 'user/register', function(res) {
                    console.log(res);
                    
                    if(res.error)
                        $('.register-menu .error-msg').show().html(res.error);
                    else {
                        Home.sendWelcomeEmail(email);
                        
                        setTimeout(function() {
                            Home.loginSuccess(res);
                        }, 1000);
                    }
                }, true);
            }
        }
        else {
            $('.register-menu .error-msg').show().html('please accept the terms of service to continue');
        }
    },
    
    forgotPassword: function() {
        $('.sign-in-menu .error-msg').hide();
        var uname = Home.formValue('#txt_uname', 'username required');
        
        if(uname != null) {
            Home.api({ uname:uname }, 'user/forgotpassword', function(res) {
                if(!res.success)
                    $('.sign-in-menu .error-msg').show().html(res.msg);
                else {
                    $('.sign-in-menu .error-msg').show().html('your new password will be emailed to you');
                    var emailList = [{ email: res.e, type: 'to' }];
                    var msg = "Your temporary password: " + res.pw + "<br/><br/>Please remember to change it after signing in (click settings icon in upper right of site).";
                    
                    $.ajax({
            	    		type: "POST",
            	        	url: "https://mandrillapp.com/api/1.0/messages/send-template.json",
            	        	data: {
            	        	    key: 'oweoS4RQJE2pOx2s8MXVhQ',
            		    		template_name: "backlive-main-template",
            	        		template_content: [{ name:'header', content:"Hi " + uname + "," }, { name:'main', content:msg }, { name:'main-left', content:'' }, { name:'main-right', content:'' }, { name:'action-button', content:"Sign-in to BackLive" }],
                                message: {
            		                to: emailList,
            		                subject: "BackLive Temporary Password",
            		                merge_vars: [{
            		                    rcpt: res.e,
                                        vars: [{ name:'LINK_ACTION', content:'' }],
            		    		    }]
                                }
            		    	}
            	        })
            	        .done(function(response) {
            	            $('.sign-in-menu .error-msg').show().html('your new password has been emailed to you');
            	        })
            	        .fail(function(response) {
            	            console.log(response);
            	            $('.sign-in-menu .error-msg').show().html('Failed to email new password, please contact BackLive');
            	        });
                }
            }, true);
        }
    },
    
    loginSuccess: function(res) {
        var expires = new Date();
            
        //research tour cookie
        if(res.tr_r)
            expires.setFullYear(2020);
        else
            expires.setFullYear(2000); //removes cookie
            
        document.cookie = "bl_tour=1; expires=" + expires.toString() + "; path=/";
           
        //backtest tour cookie
        if(res.tr_b)
            expires.setFullYear(2020);
        else
            expires.setFullYear(2000);
            
        document.cookie = "bl_bt_tour=1; expires=" + expires.toString() + "; path=/";
            
        window.location.reload();
    },
    
    playVideo: function() {
        $('#video_modal').modal('show');
        //$('#video_modal .modal-content').html('<iframe src="https://www.youtube.com/embed/GMLdzw-vrdk?autoplay=1&rel=0&vq=hd1080&hd=1" frameborder="0" style="overflow:hidden;width:100%;height:560px;"></iframe>');
        //$('#video_modal .modal-content').html('<object type="application/x-shockwave-flash" width="960" height="540" data="https://www.flickr.com/apps/video/stewart.swf" classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"><param name="flashvars" value="intl_lang=en-US&photo_secret=0719b7e1c3&photo_id=15386771925&hd_default=false"></param><param name="movie" value="https://www.flickr.com/apps/video/stewart.swf"></param><param name="bgcolor" value="#000000"></param><param name="allowFullScreen" value="true"></param><embed type="application/x-shockwave-flash" src="https://www.flickr.com/apps/video/stewart.swf" bgcolor="#000000" allowfullscreen="true" flashvars="intl_lang=en-US&photo_secret=0719b7e1c3&photo_id=15386771925&hd_default=false" width="960" height="540"></embed></object>');
        $('#video_modal .modal-content').html('<iframe src="//player.vimeo.com/video/107407701?autoplay=1" width="960" height="540" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
    
        mixpanel.track('animoto video');
    },
    
    learnMore: function() {
        $("html,body").animate({ scrollTop:$('.features-container').offset().top });
    },
    
    initChart: function(data, yMin, yMax) {
        Home.chart = new Highcharts.StockChart({
    	     chart: { renderTo: 'chart', type:"areaspline", backgroundColor: null, animation: { duration:6000, easing:'swing' },
		    	 zoomType:'x',
		    	 events: {
		             load: function() {
		                 setTimeout(function() {
		                    Home.chart.yAxis[0].setExtremes(yMin, yMax);
		                 }, 3500);
		                 setTimeout(function() {
		                    $('#chart').fadeOut(7000);
		                 }, 10000);
		             }
		         }
		     },
	         title: { text: '' },
	         rangeSelector: { selected:5, enabled:false },
	         navigator: { enabled:false },
	         xAxis: { lineWidth:0, minorGridLineWidth:0, minorTickLength:0, tickLength:0, labels:{ enabled:false } },
	         yAxis: [{ gridLineColor:'transparent', labels:{ enabled:false } }],
	         series: [{ name:"S&P 500", yAxis:0, data:data, color:"#1B3946" }], //#0c3e53" }],
			 credits:{ enabled: false },
			 legend: { enabled:false },
             scrollbar: { enabled:false },
			 plotOptions: {
	            series: {
                    lineWidth:2,
                    shadow: { color:'#888888', offsetX:2, offsetY:2, opacity:.2, width:3 },
	                animation: {
	                    duration: 4000,
	                    easing: 'swing'
	                }
	            },
                areaspline: {
                    fillOpacity: 0.1
                } 
	        },
	        tooltip: {
	            /*style: { color:'#eee' },*/
                backgroundColor:'transparent',
                shared: false,
                formatter: function() {
                    return '<span style="font-size:10px;color:#eee;">' + Highcharts.dateFormat('%A, %b %e, %Y', this.x) + '</span><br/><span style="color:#5f97a9">' 
                                + this.series.name+ ': </span> <span style="color:#eee"> ' + this.y + '</span>';
                }
            }
	    });	  
    },
    
    pageView: function(page) {
        ga('send', 'pageview', { 'page': ('/' + page), 'title': ('BackLive ' + page.ucfirst()) });
    },
    
    api: function(json, path, callback, isPost) {
    	Home.ajax(json, '/api/' + path, function(data) {
            callback(JSON.parse(data));
		}, isPost);
	},
    
    ajax: function(data, path, callback, isPost) {
		$.ajax({
			cache:false,
			type: isPost ? 'POST' : 'GET',
			async:true,
			url: path,
			dataType:'text',
			//contentType:'application/x-www-form-urlencoded; charset=UTF-8',
			beforeSend: function(xhr) {},
			complete:function(xhr, status) {},
			data:data,
			success:callback,
            error:function(jqXHR, textStatus, errorThrown) {
                callback(null);
            }
		});
	},
	
	sendContactUs: function () {
		var email = Home.formValue('#contactus_modal input[name="email"]', 'your email must be in form abs@xyz.com', false, true);
	    var name = Home.formValue('#contactus_modal input[name="name"]', 'your name is required');
	    var msg = Home.formValue('#contactus_modal textarea', 'a message is required');
	    var html = '<div style="font-size:15px;color:#eee;padding:20px;background:#12455a;border-radius:10px;"><img src="https://backlive.io/home/images/logo.png" style="display:block;width:170px;margin:0 auto 15px auto;" /><br/>' + msg + '</div>';
	    
	    if(name && msg) {
		    var emailList = [{ email: 'deji@backlivelabs.com', type: 'to' }, { email: 'craig@backlivelabs.com', type: 'to' }];
		    
			$.ajax({
		    		type: "POST",
		        	url: "https://mandrillapp.com/api/1.0/messages/send.json",
		        	data: {
		        		key: 'oweoS4RQJE2pOx2s8MXVhQ',
			            message: {
			            	from_email: email,
			            	from_name: name,
			                headers: {
			                	'Reply-To': email
			                },
			                subject: 'BackLive Contact Us',
			                to: emailList,
							html: html,
							text: msg
			    		}
			    	}
		        })
		        .done(function(response) {
		            $('#contactus_modal .error').html('Your message has been sent. Thank you.').show();
		            $('#mandrill-email-form input[name="email"]').val('');
		            $('#mandrill-email-form input[name="name"]').val('');
		            $('#mandrill-email-form textarea[name="msg"]').val('');
		        })
		        .fail(function(response) {
		            $('#contactus_modal .error').html('an uexpected error occurred, please try again').show();
		        });
	    }
	},
	
	showContactUs: function() {
	    $('#contactus_modal .error').hide().empty();
	    $('#contactus_modal').modal('show');
	},
	
	sendWelcomeEmail: function (email) {
	    var emailList = [{ email: email, type: 'to' }, { email: 'deji@backlivelabs.com', type: 'bcc' }, { email: 'craig@backlivelabs.com', type: 'bcc' }];
		    
		$.ajax({
	    		type: "POST",
	        	url: "https://mandrillapp.com/api/1.0/messages/send-template.json",
	        	data: {
	        		key: 'oweoS4RQJE2pOx2s8MXVhQ',
	        		template_name: "welcome-email",
	        		template_content: [{ name:'', content:'' }],
		            message: {
		                to: emailList
		    		}
		    	}
	        })
	        .done(function(response) {})
	        .fail(function(response) {
	            console.log(response);
	        });
	},
    
    enterCapture: function(selector, event) {
    	if(!event) 
			event = window.event;
		
		var btn = $(selector);
		var keyCode = (event.keyCode ? event.keyCode : event.which);
		
		if(keyCode == 13) {
			event.preventDefault();
			btn.focus();
			btn.click();
		}
	},
	
	formError: function(input, msg, scroll, focusTxt) {
    	$(input).addClass('form-error').val(msg).blur(); //blur in case still in focus
		
		$(input).off('focus').on('focus', function() {
			$(this).removeClass('form-error').val(focusTxt ? focusTxt : '').off('focus');
		});
		
		if(scroll)
			$("html, body").animate({ scrollTop:$(input).offset().top - 30 }, 300); //scroll to input
	},
    
    formValue: function(input, errMsg, altHighlight, isEmail) {
        if($(input).val() && $(input).val().length > 0 && !$(input).hasClass('form-error') && (!isEmail || validEmail($(input).val())))
            return $(input).val();
        else {
            Home.formError(altHighlight ? altHighlight : input, errMsg);
            return null;
        }
    },
    
    emailValue: function(email) {
	    var re = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
	    if(re.test($(email).val()))
			return $(email).val();
		else {
			Home.formError(email, 'must be in form abs@xyz.com');
			return null;
		}
	}
}