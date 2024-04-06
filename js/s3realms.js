/* global Sortable */
var list_group,li;
var final_list, font_awesome_html, splited_name_arr;

(function(window, document, $, undefined) {
  'use strict';

  window.Bucketlist = function(params) {
    var sources, options, endpoints, bucket,
        region, x, y, xLen,
        yLen;

    sources = [
      params,
      window.bucketlistConfig
    ];

    options = [
      'url',
      'limit'
    ];

    for (x = 0, xLen = sources.length; x < xLen; x++) {
      if (typeof sources[x] !== 'undefined') {
        for (y = 0, yLen = options.length; y < yLen; y++) {
          if (typeof sources[x][options[y]] !== 'undefined') {
            this[options[y]] = sources[x][options[y]];
          }
        }
      }
    }

    this.nameIcon = {
      file: 'glyphicon-file',
      directory: 'glyphicon-folder-close'
    };

    this.nameLabel = {
      file: 'label-success',
      directory: 'label-warning'
    };

    endpoints = {
      'ap-northeast-1': 's3-ap-northeast-1.amazonaws.com',
      'ap-southeast-1': 's3-ap-southeast-1.amazonaws.com',
      'ap-southeast-2': 's3-ap-southeast-2.amazonaws.com',
      'eu-west-1': 's3-eu-west-1.amazonaws.com',
      'us-east-1': 's3.amazonaws.com',
      'us-west-1': 's3-us-west-1.amazonaws.com',
      'us-west-2': 's3-us-west-2.amazonaws.com',
      'sa-east-1': 's3-sa-east-1.amazonaws.com'
    };

    if (typeof this.url === 'undefined') {
      this.url = window.location.host;
    }

    this.url = this.url.toLowerCase()
        .replace(/^\b.*?\b:/, '')
        .replace(/^\/{1,}/, '')
        .replace(/\/{1,}$/, '')
        .trim();

    if (this.url.indexOf('.s3-website-') !== -1) {
      this.url = this.url.split('.s3-website-');

      bucket = this.url[0].replace(/^\/{1,}/, '')
          .trim();

      region = this.url[1].split('.amazonaws.com')[0]
          .replace(/^\/{1,}/, '')
          .replace(/\/{1,}$/, '')
          .trim();

      this.url = endpoints[region] + '/' + bucket;
    } else {
      for (var z in endpoints) {
        if (this.url === endpoints[z]) {
          bucket = this.url.split('/')[1]
              .replace(/^\/{1,}/, '')
              .replace(/\/{1,}$/, '')
              .trim();

          this.url = this.url + '/' + bucket;

          break;
        }
      }
    }

    this.url = '//' + this.url;

    this.url = $('<a></a>').attr('href', this.url)[0];

    this.url = '//' + this.url.hostname + this.url.pathname;

    this.url = this.url.replace(/\/{1,}$/, '')
        .trim();

    if (typeof this.limit === 'number') {
      this.limit = parseInt(this.limit, 10);
    }

    if (isNaN(this.limit) === true || this.limit <= 0) {
      this.limit = 100;
    }

    this.delimiter = '/';

    this.title = document.title.trim();

    if (this.title === '') {
      this.title = 'Bucketlist';
    }

    $(function() {
      this.$title = $('#bucketlist-title');
      this.$container = $('#bucketlist-container');
      this.$breadcrumb = $('#bucketlist-breadcrumb');
      this.$tableBase = $('#bucketlist-table-base');
      this.$listLeftContainer = $('#list-group-left-part');
      this.$listRightContainer = $('#list-group-right-part');
      this.$pagerContainer = $('#bucketlist-pager-container');
      this.$loaderContainer = $('#bucketlist-loader-container');
      this.$errorContainer = $('#bucketlist-error-container');
      this.$errorHeading = $('#bucketlist-error-heading');
      this.$errorRetry = $('#bucketlist-error-retry');


      this.$title.text(this.title);

      this.$pagerContainer.on('click', 'LI:not(.disabled) > A', function(e) {
        var action = $(e.currentTarget).parent().attr('class');

        if (typeof action !== 'undefined') {
          this.navigatePaginator({
            action: action
          });
        }
      }.bind(this));

      $(window).on('hashchange', function() {
        this.init();
      }.bind(this));

      this.init();
    }.bind(this));
  };

  window.Bucketlist.prototype.init = function() {
    this.resetPage();
    this.resetMarker();
    this.navigate();
  };

  window.Bucketlist.prototype.resetPage = function() {
    this.page = 0;
  };

  window.Bucketlist.prototype.resetMarker = function() {
    this.marker = {
      current: '',
      index: ['']
    };
  };

  window.Bucketlist.prototype.showContainer = function(container) {
    container.removeClass('hidden');
  };

  window.Bucketlist.prototype.hideContainer = function(container) {
    container.addClass('hidden');
  };

  window.Bucketlist.prototype.navigate = function() {
    var hash, params, hash_arr;
    hash = window.location.hash.replace(/^#!\//, '')
        .trim();
    hash = decodeURIComponent(hash);

    this.$listLeftContainer.empty();
    this.$listRightContainer.empty();

    if(hash!=='') {
      hash_arr = hash.split('/');
      $('#dynamic-header').text(hash_arr[hash_arr.length - 2]);
    }
    else{
      $('#dynamic-header').text('BibDAO Drive');
    }
    params = {
      prefix: hash,
      delimiter: this.delimiter,
      marker: this.marker.current,
      'max-keys': this.limit
    };

    this.fetchList(params);
  };

  window.Bucketlist.prototype.fetchList = function(params) {
    this.hideContainer(this.$container);
    this.hideContainer(this.$errorContainer);
    this.showContainer(this.$loaderContainer);

    $.ajax({
      url: this.url,
      dataType: 'xml',
      //async: false,
      data: $.param(params).replace(/\+/g, '%20'),
      success: function(res) {
        this.parseReturn({
          xml: res,
          prefix: params.prefix
        });
      }.bind(this),
      error: function(err) {
        this.ajaxErrorHandler({
          error: err,
          retry: params
        });
      }.bind(this)
    });
  };

  window.Bucketlist.prototype.ajaxErrorHandler = function(params) {
    var heading = '';

    if (typeof params.error !== 'undefined') {
      if (typeof params.error.status !== 'undefined' &&
          params.error.status !== 0) {
        heading = params.error.status + ': ';
      }

      if (typeof params.error.statusText !== 'undefined' &&
          params.error.statusText !== 'error') {
        heading += params.error.statusText;
      }
    }

    if (heading === '') {
      heading = 'Error';
    }

    this.$errorHeading.empty().text(heading);

    this.$errorRetry.one('click', function() {
      this.fetchList(params.retry);
    }.bind(this));

    this.hideContainer(this.$container);
    this.hideContainer(this.$loaderContainer);
    this.showContainer(this.$errorContainer);
  };

  window.Bucketlist.prototype.parseReturn = function(params) {
    var list, xml, marker;

    list = {};
    xml = $(params.xml);
    marker = '';

    list.dirs = $.map(xml.find('CommonPrefixes'), function(x) {
      x = $(x);

      return {
        name: x.find('Prefix:first').text(),
        lastModified: '',
        size: '0',
        type: 'directory'
      };
    });

    list.files = $.map(xml.find('Contents'), function(x) {
      x = $(x);

      return {
        name: x.find('Key:first').text(),
        lastModified: x.find('LastModified:first').text(),
        size: x.find('Size:first').text(),
        type: 'file'
      };
    });

    marker = xml.find('NextMarker');
    marker = marker.length !== 0 ?
        marker.text() :
        '';

    if (marker !== '') {
      this.marker.index[this.page + 1] = marker;
    }

    this.generateList({
      list: list,
      prefix: params.prefix
    });
    this.generateBreadcrumb({
      prefix: params.prefix
    });

    this.updatePaginator();

    this.hideContainer(this.$loaderContainer);
    this.showContainer(this.$container);
  };

  window.Bucketlist.prototype.parseItemSize = function(params) {
    switch(params.bytes) {
      case undefined:
      case null:
      case '':
      case '0':
      case 0:
        return '--';
    }

    var sizes, i;

    sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    i = parseInt(Math.floor(Math.log(params.bytes) / Math.log(1024)), 10);

    return Math.round(params.bytes / Math.pow(1024, i), 2) +
        ' ' +
        sizes[i];
  };


  // fetch inner list
  window.Bucketlist.prototype.fetchInnerList = function(params) {
    $.ajax({
      url: this.url,
      dataType: 'xml',
      async: false,
      data: $.param(params).replace(/\+/g, '%20'),
      success: function(res) {
        this.parseInnerReturn({
          xml: res,
          prefix: params.prefix
        });
      }.bind(this),
      error: function(err) {
        this.ajaxInnerErrorHandler({
          error: err,
          retry: params
        });
      }.bind(this)
    });
  };

  window.Bucketlist.prototype.ajaxInnerErrorHandler = function(params) {
    var heading = '';

    if (typeof params.error !== 'undefined') {
      if (typeof params.error.status !== 'undefined' &&
          params.error.status !== 0) {
        heading = params.error.status + ': ';
      }

      if (typeof params.error.statusText !== 'undefined' &&
          params.error.statusText !== 'error') {
        heading += params.error.statusText;
      }
    }

    if (heading === '') {
      heading = 'Error';
    }

    this.$errorHeading.empty().text(heading);

    this.$errorRetry.one('click', function() {
      this.fetchInnerList(params.retry);
    }.bind(this));
  };

  window.Bucketlist.prototype.parseInnerReturn = function(params) {
    var list, xml;

    list = {};
    xml = $(params.xml);

    list.dirs = $.map(xml.find('CommonPrefixes'), function(x) {
      x = $(x);

      return {
        name: x.find('Prefix:first').text(),
        lastModified: '',
        size: '0',
        type: 'directory'
      };
    });

    list.files = $.map(xml.find('Contents'), function(x) {
      x = $(x);

      return {
        name: x.find('Key:first').text(),
        lastModified: x.find('LastModified:first').text(),
        size: x.find('Size:first').text(),
        type: 'file'
      };
    });

    this.generateInnerList({
      list: list,
      prefix: params.prefix
    });

  };

  window.Bucketlist.prototype.parseItemSize = function(params) {
    switch(params.bytes) {
      case undefined:
      case null:
      case '':
      case '0':
      case 0:
        return '--';
    }

    var sizes, i;

    sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    i = parseInt(Math.floor(Math.log(params.bytes) / Math.log(1024)), 10);

    return Math.round(params.bytes / Math.pow(1024, i), 2) +
        ' ' +
        sizes[i];
  };

  window.Bucketlist.prototype.generateList = function(params) {
    var inner_dirs_list;
    for (var x in params.list) {
      var res, y, len;

      if (x!=='dirs'){
        list_group=['<div class="list-group">'];
        li= $('<div class="list-group"> <a class="list-group-item"></a></div>');
      }

      res = params.list[x];

      for (y = 0, len = res.length; y < len; y++) {
        var type, name, lastModified, size,
            url, attr;

        type = res[y].type;

        name = typeof res[y].name !== 'undefined' ?
            res[y].name :
            '--';

        if (name !== '--') {
          name = name.replace(
              new RegExp('^' + params.prefix),
              '',
              'i'
          ).trim();
        }

        if (name !== '') {

          url = name;

          switch (type) {
            case 'directory':
              url = '#!/' + encodeURIComponent(params.prefix + url);
              break;
            default:
              url = this.url + '/' + params.prefix + url;
              break;
          }

          attr = {
            name: {
              href: url,
              download: type === 'directory' ?
                  null :
                  name
            }
          };


          if(type=='directory'){
            list_group=['<div class="list-group">'];
            li= $('<div class="list-group"> <a class="list-group-item active"></a></div>');

            li.find('A:first')
                .text(name.replace('/',''))
                .attr(attr.name);
            list_group.push(li.html());

            var params2;
            params2 = {
              prefix: decodeURIComponent(url.replace(/^#!\//, '')),
              delimiter: this.delimiter,
              marker: this.marker.current,
              'max-keys': this.limit
            };

            this.fetchInnerList(params2);

            list_group.push('</div>');
            if($.trim(this.$listLeftContainer.text()).length > $.trim(this.$listRightContainer.text()).length+50) {
              this.$listRightContainer
                  .append(list_group.join(''));
            }
            else{
              this.$listLeftContainer
                  .append(list_group.join(''));
            }
            console.log(this.$listLeftContainer.text().length);
            console.log(this.$listRightContainer.text().length);

          }
          else{
            splited_name_arr = name.split('.');

            if(splited_name_arr[1]!=='xml') {
              if (splited_name_arr[1] == 'docx')
                font_awesome_html = '<span class="fa fa-file-word-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'doc')
                font_awesome_html = '<span class="fa fa-file-word-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'pdf')
                font_awesome_html = '<span class="fa fa-file-pdf-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'ppt')
                font_awesome_html = '<span class="fa fa-file-powerpoint-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'pptx')			  
                font_awesome_html = '<span class="fa fa-file-powerpoint-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'xls')
                font_awesome_html = '<span class="fa fa-file-excel-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'xlsx')
                font_awesome_html = '<span class="fa fa-file-excel-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'mp4')
                font_awesome_html = '<span class="fa fa-file-video-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'avi')
                font_awesome_html = '<span class="fa fa-file-video-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'mov')
                font_awesome_html = '<span class="fa fa-file-video-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'wmv')
                font_awesome_html = '<span class="fa fa-file-video-o"></span>' + splited_name_arr[0];
              else if (splited_name_arr[1] == 'zip')
                font_awesome_html = '<span class="fa fa-files-o"></span>' + splited_name_arr[0];
              else
                font_awesome_html = '<span class="fa fa-file-image-o"></span>' + splited_name_arr[0];

              li.find('A:first')
                  .html(font_awesome_html)
                  .attr(attr.name);
              list_group.push(li.html());
            }
          }

        }
      }

      if (x!=='dirs') {
        list_group.push('</div>');
        if($.trim(this.$listLeftContainer.text()).length > $.trim(this.$listRightContainer.text()).length+50) {
          this.$listRightContainer
              .append(list_group.join(''));
        }
        else{
          this.$listLeftContainer
              .append(list_group.join(''));
        }

        console.log(this.$listLeftContainer.text().length);
        console.log(this.$listRightContainer.text().length);
      }
    }

  };

  window.Bucketlist.prototype.generateInnerList = function(params){
    li= $('<div class="list-group"> <a class="list-group-item"></a></div>');
    for (var x in params.list) {
      var res, y, len;

      res = params.list[x];

      for (y = 0, len = res.length; y < len; y++) {
        var type, name, url, attr;

        type = res[y].type;

        name = typeof res[y].name !== 'undefined' ?
            res[y].name :
            '--';

        if (name !== '--') {
          name = name.replace(
              new RegExp('^' + params.prefix),
              '',
              'i'
          ).trim();
        }

        if (name !== '') {

          url = name;

          switch (type) {
            case 'directory':
              url = '#!/' + encodeURIComponent(params.prefix + url);
              font_awesome_html = '<span class="fa fa-folder-open-o"></span>'+ name.replace('/','');
              break;
            default:
              url = this.url + '/' + params.prefix + url;

              splited_name_arr = name.split('.');

              if(splited_name_arr[1]=='docx')
                font_awesome_html = '<span class="fa fa-file-word-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='doc')
                font_awesome_html = '<span class="fa fa-file-word-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='pdf')
                font_awesome_html = '<span class="fa fa-file-pdf-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='ppt')
                font_awesome_html = '<span class="fa fa-file-powerpoint-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='pptx')
                font_awesome_html = '<span class="fa fa-file-powerpoint-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='xlsx')
                font_awesome_html = '<span class="fa fa-file-excel-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='xls')
                font_awesome_html = '<span class="fa fa-file-excel-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='mp4')
                font_awesome_html = '<span class="fa fa-file-video-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='avi')
                font_awesome_html = '<span class="fa fa-file-video-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='mov')
                font_awesome_html = '<span class="fa fa-file-video-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='wmv')
                font_awesome_html = '<span class="fa fa-file-video-o"></span>'+ splited_name_arr[0];
              else if(splited_name_arr[1]=='zip')
                font_awesome_html = '<span class="fa fa-files-o"></span>'+ splited_name_arr[0];
              else
                font_awesome_html = '<span class="fa fa-file-photo-o"></span>'+ splited_name_arr[0];

              break;
          }

          attr = {
            name: {
              href: url,
              download: type === 'directory' ?
                  null :
                  name
            }
          };

          li.find('A:first')
              .html(font_awesome_html)
              .attr(attr.name);

          if(type==='directory')
            list_group.push(li.html());
          else if(splited_name_arr[1]!=='xml')
            list_group.push(li.html());
        }
      }

    }
  };

  window.Bucketlist.prototype.updatePaginator = function() {
    var previous, next;

    previous = this.$pagerContainer.find('LI.previous:first');
    next = this.$pagerContainer.find('LI.next:first');

    this.hideContainer(this.$pagerContainer);

    previous.addClass('disabled');
    next.addClass('disabled');

    if (this.page > 0) {
      previous.removeClass('disabled');
    }

    if (this.page < this.marker.index.length - 1) {
      next.removeClass('disabled');
    }

    if (!previous.hasClass('disabled') || !next.hasClass('disabled')) {
      this.showContainer(this.$pagerContainer);
    }
  };

  window.Bucketlist.prototype.navigatePaginator = function(params) {
    var step;

    if (typeof params.action === 'string') {
      switch (params.action) {
        case 'previous':
          this.page--;
          break;
        case 'next':
          this.page++;
          break;
      }

      step = this.marker.index[this.page];

      if (typeof step === 'string') {
        this.marker.current = step;
        this.navigate();
      }
    }
  };

  window.Bucketlist.prototype.generateBreadcrumb = function(params) {
    var crumbs, li, ol, prefix,
        len, x;

    crumbs = [];

    if (typeof params.prefix === 'string') {
      crumbs = params.prefix.split('/');
    }

    li = $('<ol><li><a class="bucketlist-nav" href="#!/">BibDAO Drive</a></li></ol>');
    ol = [li.html()];
    prefix = '#!/';
    len = crumbs.length;

    if (len > 1) {
      for (x = 0, len = len - 1; x < len; x++) {
        var text = crumbs[x].trim();

        prefix = prefix + text + '/';

        li.find('LI:first > A:first')
            .text(text)
            .attr('href', prefix);

        ol.push(li.html());
      }
    }

    this.$breadcrumb
        .empty()
        .html(ol.join(''));
  };
})(window, document, jQuery);
