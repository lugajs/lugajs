<div class="panel panel-default">
	<div class="panel-heading">Getting started</div>
	<div class="panel-body">
		<p>
			In order to use Luga Data, you must include the JavaScript files. First jQuery, then <a
				href="../dist/luga.common.min.js">Luga Common</a> and <a href="../dist/luga.data.min.js">Luga
			Data</a> (in this order)
		</p>

		<p>
			If you want to use <a href="#data/region/handlebars">HTML templating</a>, you must include <a
				href="http://handlebarsjs.com/">Handlebars</a> as well.
		</p>

<pre><code class="language-markup">&lt;script src="js/jquery.min.js"&gt;&lt;/script&gt;
&lt;script src="js/handlebars.min.js"&gt;&lt;/script&gt;
&lt;script src="js/luga.common.min.js"&gt;&lt;/script&gt;
&lt;script src="js/luga.data.min.js"&gt;&lt;/script&gt;
</code></pre>

		<p>
			In order to become familiar with the fundamental building blocks,
			we recommend to start with <a href="#data/dataset/getting-started">dataSet</a> and their <a
				href="#data/dataset/api">API</a>.
		</p>

		<p>
			If you are just interested in quickly using Luga Data's out of the box features and you don't care about its
			inner working, you can skip this section.
			But if you want to get a better understanding of the library or if you need to customize and extend it,
			becoming familiar with <a href="#common/notifier">luga.Notifier</a> is paramount.
			Binding between DataSet, DetailSet and Region objects is all achieved using Notifier.
		</p>

		<p>
			If instead you are the kind of person who prefers to get up and running immediately, you may dive directly
			into,
			<a href="#data/region/getting-started">regions</a>, <a href="#data/dataset/databinding">databinding</a> to
			dynamically generate your GUI.
			Or quickly assemble a <a href="#data/detailset/master-details">master-details</a> page.
		</p>

	</div>
</div>