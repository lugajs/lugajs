<div class="panel panel-default">
	<div class="panel-heading">&lt;select&gt; tag</div>
	<div class="panel-body">

		<p>
			There are two different attributes that apply only to drop-down lists created created using the &lt;select&gt;
			tag.
		</p>

		<p>
			data-lugavalidator-invalidindex prevents selection of an entry on a given position (zero based):
		</p>
				
<pre><code class="language-markup">&lt;select name="lady" data-lugavalidator-invalidindex="0"&gt;
</code></pre>
		<p>
			data-lugavalidator-invalidvalue prevents selection of an entry with a given value.:
		</p>

<pre><code class="language-markup">&lt;select name="dish" data-lugavalidator-invalidvalue="Crepes"&gt;
</code></pre>

	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Just a drink</div>
	<div class="panel-body">

		<form data-lugavalidator-validate="true">
			<div class="form-group">
				<p class="help-block">You would like to take a drink with:</p>
				<select class="form-control" name="lady" data-lugavalidator-invalidindex="0"
						data-lugavalidator-message="Please select a lady">
					<option>Your choice</option>
					<option value="Kate">Kate Beckinsale</option>
					<option value="Jennifer">Jennifer Connelly</option>
					<option value="Salma">Salma Hayek</option>
					<option value="Gisele">Gisele Bundchen</option>
					<option value="Emmanuelle">Emmanuelle Beart</option>
					<option value="Liz">Liz Hurley</option>
				</select>
			</div>
			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>

	</div>
</div>