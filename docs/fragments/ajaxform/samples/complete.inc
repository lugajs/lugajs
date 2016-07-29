<div class="panel panel-default">
	<div class="panel-heading">Complete Form</div>
	<div class="panel-body">
		<form action="ajaxform-action.json" data-lugajax-form="true">
			<div class="form-group">
				<label for="age">Age</label>
				<input type="text" class="form-control" id="age" name="age" value="18"/>
			</div>
			<div class="form-group">
				<label for="name" class="control-label">Name</label>
				<input type="text" class="form-control" id="name" name="name"/>
			</div>
			<div class="form-group">
				<label for="email" class="control-label">Email</label>
				<input type="text" class="form-control" id="email" name="email"/>
			</div>
			<div class="form-group">
				<label for="date">Date</label>
				<input type="text" class="form-control" id="date" name="date" value="2005-05-09"/>
			</div>
			<div class="form-group">
				<label for="comments">Comments</label>
				<textarea id="comments" class="form-control" name="comments" cols="20" rows="3"></textarea>
			</div>

			<p class="help-block">
				Italy's major contributions to modern civilization? Pick at least one:
			</p>

			<div class="checkbox">
				<label><input type="checkbox" name="italy" value="Pizza"/>Pizza</label>
			</div>
			<div class="checkbox">
				<label><input type="checkbox" name="italy" value="Spaghetti"/>Spaghetti</label>
			</div>
			<div class="checkbox">
				<label><input type="checkbox" name="italy" value="Sophia"/>Sophia Loren</label>
			</div>
			<div class="checkbox">
				<label><input type="checkbox" name="italy" value="Leonardo"/>Leonardo Da Vinci</label>
			</div>

			<p class="help-block">
				You would like to take a drink with? (You can pick only one, sorry):
			</p>

			<div class="radio">
				<label><input type="radio" name="lady"/>Nicole Kidman</label>
			</div>
			<div class="radio">
				<label><input type="radio" name="lady" value="Kate Beckinsale"/>Kate Beckinsale</label>
			</div>
			<div class="radio">
				<label><input type="radio" name="lady" value="Jennifer Connelly"/>Jennifer Connelly</label>
			</div>
			<div class="radio">
				<label><input type="radio" name="lady" value="Liz Hurley"/>Liz Hurley</label>
			</div>

			<div class="form-group">
				<input type="submit" value="Submit"/>
			</div>
		</form>
	</div>
</div>