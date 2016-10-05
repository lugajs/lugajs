<div class="panel panel-default">
	<div class="panel-heading">Radio buttons</div>
	<div class="panel-body">

		<p>
			Radio buttons are a special kind of field, since they come in groups, sharing the same name but having
			different values.
		</p>

		<p>
			Luga Validator validates a set of radios with the same name as a unique entity.
			So, inside a set of radios, you can define the validation attributes only once (if you specify attributes
			with conflicting values, the last one wins):
		</p>
				
<pre><code class="language-markup">&lt;input name="drink" type="radio" class="boxes" value="Nicole" data-lugavalidator-required="true"/&gt;
&lt;input name="drink" type="radio" class="boxes" value="Kate"/&gt;
</code></pre>

	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Just a drink</div>
	<div class="panel-body">

		<form data-lugavalidator-validate="true">
			<p class="help-block">You would like to take a drink with: (you can pick only one, sorry)</p>

			<div class="radio">
				<label><input name="drink" type="radio" class="boxes" value="Nicole"
							  data-lugavalidator-required="true"
							  data-lugavalidator-message="Please select a lady"/> Nicole Kidman</label>
			</div>
			<div class="radio">
				<label><input name="drink" type="radio" class="boxes" value="Kate"/> Kate Beckinsale</label>
			</div>
			<div class="radio">
				<label><input name="drink" type="radio" class="boxes" value="Jennifer"/> Jennifer
					Connelly</label>
			</div>
			<div class="radio">
				<label><input name="drink" type="radio" value="Salma"/> Salma Hayek</label></div>
			<div class="radio">
				<label><input name="drink" type="radio" value="Gisele"/> Gisele Bundchen</label></div>
			<div class="radio">
				<label><input name="drink" type="radio" value="Emmanuelle"/> Emmanuelle Beart</label>
			</div>
			<div class="radio">
				<label><input name="drink" type="radio" value="Liz"/> Liz Hurley</label>
			</div>

			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>

	</div>
</div>