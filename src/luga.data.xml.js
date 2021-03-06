/* global ActiveXObject */

(function(){
	"use strict";

	luga.namespace("luga.data.xml");

	luga.data.xml.MIME_TYPE = "application/xml";
	luga.data.xml.ATTRIBUTE_PREFIX = "_";
	luga.data.xml.DOM_ACTIVEX_NAME = "MSXML2.DOMDocument.6.0";

	/**
	 * Given a DOM node, evaluate an XPath expression against it
	 * Results are returned as an array of nodes. An empty array is returned in case there is no match
	 * @param {Node} node
	 * @param {string} path
	 * @return {Array<Node>}
	 */
	luga.data.xml.evaluateXPath = function(node, path){
		const retArray = [];
		/* istanbul ignore else IE-only */
		if(window.XPathEvaluator !== undefined){
			const evaluator = new XPathEvaluator();
			const result = evaluator.evaluate(path, node, null, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
			let currentNode = result.iterateNext();
			// Iterate and populate the array
			while(currentNode !== null){
				retArray.push(currentNode);
				currentNode = result.iterateNext();
			}
		}
		else if(window.ActiveXObject !== undefined){
			const selectedNodes = node.selectNodes(path);
			// Extract the nodes out of the nodeList returned by selectNodes and put them into an array
			// We could directly use the nodeList returned by selectNodes, but this would cause inconsistencies across browsers
			for(let i = 0; i < selectedNodes.length; i++){
				retArray.push(selectedNodes[i]);
			}
		}
		return retArray;
	};

	/**
	 * Convert an XML node into a JavaScript object
	 * @param {Node} node
	 * @return {Object}
	 */
	luga.data.xml.nodeToHash = function(node){
		const obj = {};
		attributesToProperties(node, obj);
		childrenToProperties(node, obj);
		return obj;
	};

	/**
	 * Map attributes to properties
	 * @param {Node}   node
	 * @param {Object} obj
	 */
	function attributesToProperties(node, obj){
		if((node.attributes === null) || (node.attributes === undefined)){
			return;
		}
		for(let i = 0; i < node.attributes.length; i++){
			const attr = node.attributes[i];
			obj[luga.data.xml.ATTRIBUTE_PREFIX + attr.name] = attr.value;
		}
	}

	/**
	 * Map child nodes to properties
	 * @param {Node}   node
	 * @param {Object} obj
	 */
	function childrenToProperties(node, obj){
		for(let i = 0; i < node.childNodes.length; i++){
			const child = node.childNodes[i];

			if(child.nodeType === 1 /* Node.ELEMENT_NODE */){
				let isArray = false;
				const tagName = child.nodeName;

				if(obj[tagName] !== undefined){
					// If the property exists already, turn it into an array
					if(obj[tagName].constructor !== Array){
						const curValue = obj[tagName];
						obj[tagName] = [];
						obj[tagName].push(curValue);
					}
					isArray = true;
				}

				if(nodeHasText(child) === true){
					// This may potentially override an existing property
					obj[child.nodeName] = getTextValue(child);
				}
				else{
					const childObj = luga.data.xml.nodeToHash(child);
					if(isArray === true){
						obj[tagName].push(childObj);
					}
					else{
						obj[tagName] = childObj;
					}
				}
			}
		}
	}

	/**
	 * Extract text out of a TEXT or CDATA node
	 * @param {Node} node
	 * @return {string}
	 */
	function getTextValue(node){
		const child = node.childNodes[0];
		/* istanbul ignore else */
		if((child.nodeType === 3) /* TEXT_NODE */ || (child.nodeType === 4) /* CDATA_SECTION_NODE */){
			return child.data;
		}
	}

	/**
	 * Return true if a node contains value, false otherwise
	 * @param {Node}   node
	 * @return {boolean}
	 */
	function nodeHasText(node){
		const child = node.childNodes[0];
		if((child !== null) && (child.nextSibling === null) && (child.nodeType === 3 /* Node.TEXT_NODE */ || child.nodeType === 4 /* CDATA_SECTION_NODE */)){
			return true;
		}
		return false;
	}

	/**
	 * Serialize a DOM node into a string
	 * @param {Node}   node
	 * @return {string}
	 */
	luga.data.xml.nodeToString = function(node){
		/* istanbul ignore if IE-only */
		if(window.ActiveXObject !== undefined){
			// IE11 supports XMLSerializer but fails on serializeToString()
			return node.xml;
		}
		else{
			const serializer = new XMLSerializer();
			return serializer.serializeToString(node, luga.data.xml.MIME_TYPE);
		}
	};

	/**
	 * Create a DOM Document out of a string
	 * @param {string} xmlStr
	 * @return {Document}
	 */
	luga.data.xml.parseFromString = function(xmlStr){
		let xmlParser;
		/* istanbul ignore if IE-only */
		if(window.ActiveXObject !== undefined){
			// IE11 supports DOMParser but fails on parseFromString()
			const xmlDOMObj = new ActiveXObject(luga.data.xml.DOM_ACTIVEX_NAME);
			xmlDOMObj.async = false;
			xmlDOMObj.setProperty("SelectionLanguage", "XPath");
			xmlDOMObj.loadXML(xmlStr);
			return xmlDOMObj;
		}
		else{
			xmlParser = new DOMParser();
			const domDoc = xmlParser.parseFromString(xmlStr, luga.data.xml.MIME_TYPE);
			return domDoc;
		}
	};

}());