/*******************************************************************************
 * Copyright (c) 2011, 2012 EclipseSource and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    EclipseSource - initial API and implementation
 ******************************************************************************/

rwt.protocol.AdapterRegistry.add( "rwt.widgets.Label", {

  factory : function( properties ) {
    var styleMap = rwt.protocol.AdapterUtil.createStyleMap( properties.style );
    styleMap.MARKUP_ENABLED = properties.markupEnabled;
    var result = new rwt.widgets.Label( styleMap );
    rwt.protocol.AdapterUtil.addStatesForStyles( result, properties.style );
    result.setUserData( "isControl", true );
    rwt.protocol.AdapterUtil.setParent( result, properties.parent );
    return result;
  },

  destructor : rwt.protocol.AdapterUtil.getControlDestructor(),

  properties : rwt.protocol.AdapterUtil.extendControlProperties( [
    "text",
    "image",
    "alignment",
    "appearance",
    "leftMargin",
    "topMargin",
    "rightMargin",
    "bottomMargin",
    "backgroundGradient"
  ] ),

  propertyHandler : rwt.protocol.AdapterUtil.extendControlPropertyHandler( {
    "backgroundGradient" : rwt.protocol.AdapterUtil.getBackgroundGradientHandler()
  } ),

  listeners : rwt.protocol.AdapterUtil.extendControlListeners( [] ),

  listenerHandler : rwt.protocol.AdapterUtil.extendControlListenerHandler( {} )

} );