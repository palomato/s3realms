<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>BibDAO Drive</title>
    <meta name="description" content="BibDAO Drive">
  <link rel="icon" href="favicon.ico">
  <link rel="stylesheet" href="css/bootstrap.min.css">
  <!-- Open Sans Font -->
  <link href='https://fonts.googleapis.com/css?family=Open+Sans:400italic,300,400,700,' rel='stylesheet' type='text/css'>
  <!-- Bucketlist -->
  <link rel="stylesheet" href="css/bucketlist.css?_=">
  <link rel="stylesheet" href="css/font-awesome.css?_=">
  <!-- Bucketlist Config -->
  <script type="text/javascript">
    window.bucketlistConfig = {
      url: 'objects-us-east-1.dream.io/realmstestbucket'
      // limit: 100
    };
  </script>
</head>
<body>





<div id="bucketlist-container" class="container hidden">
  <div class="row">
    <div class="col-md-12">
      <h1 class="page-header"><strong id="dynamic-header">BibDAO S3 Drive</strong></h1>      
<!-- Breadcrumbs -->      
      <ol id="bucketlist-breadcrumb" class="breadcrumb"></ol>
    </div>
  </div>
  <div class="row">
    <div class="col-md-12">
      <div id="bucketlist-table-container">
        <table class="bucketlist-table"></table>
      </div>
      <div id="bucketlist-list-container">
        <div id="list-group-left-part">
        </div>
        <div id="list-group-right-part">
        </div>
        <div style="clear: both;"></div>
      </div>

      <ul id="bucketlist-pager-container" class="pager">
        <li class="previous disabled">
          <a>&larr; Previous</a>
        </li>
        <li class="next disabled">
          <a>Next &rarr;</a>
        </li>
      </ul>
    </div>
  </div>

    <!-- /.row -->
        <hr>
    <!-- Footer -->
        <footer>
            <div class="row" style="padding-bottom:30px">
                <div class="col-lg-12">
                    <p>Bibliotheca DAO S3 Drive demo</p>
                </div>
            </div>
        </footer>
    <!-- ./footer --> 

</div>
<div id="bucketlist-loader-container" class="container hidden">
  <div class="row">
    <div class="col-md-2 col-md-offset-5">
      <div id="bucketlist-loader-gif" class="center-block"></div>
    </div>
  </div>
</div>
<div id="bucketlist-error-container" class="container hidden">
  <div class="row">
    <div class="col-md-6 col-md-offset-3">
      <div class="panel panel-danger">
        <div id="bucketlist-error-heading" class="panel-heading"></div>
        <div class="panel-body">
          <img id="bucketlist-error-gif" class="center-block img-responsive img-rounded" src="img/error.gif?_=" alt="Error">
          <p class="text-center">Please make sure your S3 bucket's permissions and CORS configuration are set correctly and try again.</p>
        </div>
        <div class="panel-footer">
          <button id="bucketlist-error-retry" type="button" class="btn btn-default btn-block">Retry</button>
        </div>
      </div>
    </div>
  </div>
</div>
<div id="bucketlist-table-base" class="hidden">
  <table class="table table-hover table-bordered">
    <thead>
    <tr>
      <th>
        <span class="bucketlist-table-head-label">Type</span>
        <span class="bucketlist-sort-icon text-right invisible">Type</span>
      </th>
      <th>
        <span class="bucketlist-table-head-label">Name</span>
        <span class="bucketlist-sort-icon text-right invisible">Name</span>
      </th>
      <th>
        <span class="bucketlist-table-head-label">Last Modified</span>
        <span class="bucketlist-sort-icon text-right invisible">Last Modified</span>
      </th>
      <th>
        <span class="bucketlist-table-head-label">Size</span>
        <span class="bucketlist-sort-icon text-right invisible">Size</span>
      </th>
    </tr>
    </thead>
    <tbody>
    <tr>
      <td></td>
    </tr>
    </tbody>
  </table>
</div>
<!-- jQuery -->
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<!-- Bootstrap -->
<script src="//netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
<!-- Sortable -->
<script src="js/sortable.js?_="></script>
<!-- Bucketlist -->
<script src="js/s3realms.js?_="></script>
<script type="text/javascript">
  new window.Bucketlist();
</script>
</body>
</html>