<script>
	function dependonbox(fieldNode){
		// The field is required only if the box is checked
		if(jQuery("#specialmeal").prop("checked") === true){
			return true;
		}
		return false;
	};
</script>

<div class="panel panel-default">
	<div class="panel-heading">Conditional validation</div>
	<div class="panel-body">

		<p>
			Out of the box, Luga Validator doesn't provide a way to perform conditional validation. This was a design
			choice.
			Creating a flexible and generic solution would require a lot of code and would undoubtedly fail to cover all
			contingencies.
		</p>

		<p>
			Whenever you need to perform conditional validation, all you need to do is write a custom JavaScript
			function and use its name as the value of the data-lugavalidator-required attribute
		</p>

		<p>
			In this example you want to validate a text field only if the associated checkbox is checked. The HTML code
			will look like this:
		</p>

		<pre><code class="language-markup">&lt;input type="text" name="newmeal" id="newmeal" data-lugavalidator-required="dependonbox" luga-data-message="Meal's name?"/&gt;</code></pre>

		<p>
			Now you need to write the JavaScript code that will enforce conditional validation, based on whatever custom
			condition you need to handle.
			The function should expect the field's DOM node as its only argument and return a boolean:
		</p>

<pre><code class="line-numbers language-javascript">function dependonbox(fieldNode){
	// The field is required only if the box is checked
	if(jQuery("#specialmeal").prop("checked") === true){
		return true;
	}
	return false;
};</code></pre>

	</div>
</div>

<div class="panel panel-default">
	<div class="panel-heading">Special meal</div>
	<div class="panel-body">
		<form data-lugavalidator-validate="true">
			<div class="checkbox">
				<label class="control-label">
					<input name="specialmeal" id="specialmeal" type="checkbox" checked="checked" value="true"/>
					Yes, I want a special meal</label>
			</div>
			<div class="form-group">
				<label for="newmeal" class="control-label">Specify the special meal's name</label>
				<input type="text" class="form-control" name="newmeal" id="newmeal"
					   data-lugavalidator-required="dependonbox" data-lugavalidator-message="Meal's name?"/>
			</div>
			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>
	</div>
</div>