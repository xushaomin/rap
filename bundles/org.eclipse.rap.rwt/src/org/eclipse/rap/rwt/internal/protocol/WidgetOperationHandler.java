/*******************************************************************************
 * Copyright (c) 2013 EclipseSource and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    EclipseSource - initial API and implementation
 ******************************************************************************/
package org.eclipse.rap.rwt.internal.protocol;

import static org.eclipse.rap.rwt.internal.protocol.ClientMessageConst.EVENT_PARAM_DETAIL;
import static org.eclipse.rap.rwt.internal.protocol.ClientMessageConst.EVENT_PARAM_HEIGHT;
import static org.eclipse.rap.rwt.internal.protocol.ClientMessageConst.EVENT_PARAM_WIDTH;
import static org.eclipse.rap.rwt.internal.protocol.ClientMessageConst.EVENT_PARAM_X;
import static org.eclipse.rap.rwt.internal.protocol.ClientMessageConst.EVENT_PARAM_Y;

import java.lang.reflect.InvocationTargetException;
import java.lang.reflect.Method;

import org.eclipse.rap.json.JsonObject;
import org.eclipse.rap.json.JsonValue;
import org.eclipse.rap.rwt.remote.AbstractOperationHandler;
import org.eclipse.swt.SWT;
import org.eclipse.swt.graphics.Rectangle;
import org.eclipse.swt.widgets.Event;
import org.eclipse.swt.widgets.Widget;


public class WidgetOperationHandler extends AbstractOperationHandler {

  protected final Widget widget;

  public WidgetOperationHandler( Widget widget ) {
    this.widget = widget;
  }

  @Override
  public void handleNotify( String eventName, JsonObject properties ) {
    try {
      String name = "handleNotify" + eventName;
      Method method = getClass().getMethod( name, JsonObject.class );
      method.invoke( this, properties );
    } catch( SecurityException exception ) {
      throw new RuntimeException( exception );
    } catch( NoSuchMethodException e ) {
      String message = eventName + " notify operation not supported by this handler";
      throw new UnsupportedOperationException( message );
    } catch( IllegalArgumentException exception ) {
      throw new RuntimeException( exception );
    } catch( IllegalAccessException exception ) {
      throw new RuntimeException( exception );
    } catch( InvocationTargetException exception ) {
      throw new RuntimeException( exception );
    }
  }

  /*
   * PROTOCOL NOTIFY Selection
   *
   * @param altKey (boolean) true if the ALT key was pressed
   * @param ctrlKey (boolean) true if the CTRL key was pressed
   * @param shiftKey (boolean) true if the SHIFT key was pressed
   */
  public void handleNotifySelection( JsonObject properties ) {
    Event event = createSelectionEvent( SWT.Selection, properties );
    widget.notifyListeners( SWT.Selection, event );
  }

  /*
   * PROTOCOL NOTIFY DefaultSelection
   *
   * @param altKey (boolean) true if the ALT key was pressed
   * @param ctrlKey (boolean) true if the CTRL key was pressed
   * @param shiftKey (boolean) true if the SHIFT key was pressed
   */
  public void handleNotifyDefaultSelection( JsonObject properties ) {
    Event event = createSelectionEvent( SWT.DefaultSelection, properties );
    widget.notifyListeners( SWT.DefaultSelection, event );
  }

  /*
   * PROTOCOL NOTIFY Help
   */
  public void handleNotifyHelp( JsonObject properties ) {
    widget.notifyListeners( SWT.Help, new Event() );
  }

  protected static Event createSelectionEvent( int eventType, JsonObject properties ) {
    Event event = new Event();
    event.type = eventType;
    event.stateMask = readStateMask( properties );
    event.detail = readDetail( properties );
    event.setBounds( readBounds( properties ) );
    return event;
  }

  protected static int readStateMask( JsonObject properties ) {
    int stateMask = SWT.NONE;
    if( JsonValue.TRUE.equals( properties.get( "altKey" ) ) ) {
      stateMask |= SWT.ALT;
    }
    if( JsonValue.TRUE.equals( properties.get( "ctrlKey" ) ) ) {
      stateMask |= SWT.CTRL;
    }
    if( JsonValue.TRUE.equals( properties.get( "shiftKey" ) ) ) {
      stateMask |= SWT.SHIFT;
    }
    return stateMask;
  }

  protected static int readDetail( JsonObject properties ) {
    int detail = SWT.NONE;
    JsonValue value = properties.get( EVENT_PARAM_DETAIL );
    if( value != null && value.isString() ) {
      if( "check".equals( value.asString() ) ) {
        detail = SWT.CHECK;
      }
    }
    return detail;
  }

  protected static Rectangle readBounds( JsonObject properties ) {
    Rectangle bounds = new Rectangle( 0, 0, 0, 0 );
    JsonValue x = properties.get( EVENT_PARAM_X );
    bounds.x = x == null ? 0 : x.asInt();
    JsonValue y = properties.get( EVENT_PARAM_Y );
    bounds.y = y == null ? 0 : y.asInt();
    JsonValue width = properties.get( EVENT_PARAM_WIDTH );
    bounds.width = width == null ? 0 : width.asInt();
    JsonValue height = properties.get( EVENT_PARAM_HEIGHT );
    bounds.height = height == null ? 0 : height.asInt();
    return bounds;
  }

}