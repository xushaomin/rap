/*******************************************************************************
 * Copyright (c) 2010, 2012 EclipseSource and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    EclipseSource - initial API and implementation
 ******************************************************************************/

(function(){

qx.Class.define( "rwt.widgets.Text", {

  extend : rwt.widgets.base.BasicText,

  construct : function( isTextarea ) {
    this.base( arguments );
    if( isTextarea ) {
      this._inputTag = "textarea";
      this._inputType = null;
      this._inputOverflow = "auto";
      this.setAppearance( "text-area" );
      this.setAllowStretchY( true );
      this.__oninput = rwt.util.Function.bindEvent( this._oninputDomTextarea, this );
    }
    this._hasDefaultSelectionListener = false;
    this._hasModifyListener = false;
    this._modifyScheduled = false;
    this._message = null;
    this._messageElement = null;
    this._searchIconElement = null;
    this._cancelIconElement = null;
  },

  destruct : function() {
    this._messageElement = null;
    this._searchIconElement = null;
    this._cancelIconElement = null;
    this.__oninput = null;
  },

  properties : {

    wrap : {
      check : "Boolean",
      init : true,
      apply : "_applyWrap"
    }

  },

  members : {

    //////
    // API

    setMessage : function( value ) {
      if( this._inputTag !== "textarea" ) {
        this._message = value;
        this._updateMessage();
      }
    },

    getMessage : function() {
      return this._message;
    },

    setPasswordMode : function( value ) {
      var type = value ? "password" : "text";
      if( this._inputTag != "textarea" && this._inputType != type ) {
        this._inputType = type;
        if( this._isCreated ) {
          if( rwt.client.Client.getEngine() === "mshtml" ) {
            this._reCreateInputField();
          } else {
            this._inputElement.type = this._inputType;
          }
        }
      }
    },

    setHasDefaultSelectionListener : function( value ) {
      if( !this.hasState( "rwt_MULTI" ) ) {
        this._hasDefaultSelectionListener = value;
      }
    },

    hasSelectionListener : function() {
      // Emulate SWT (on Windows) where a default button takes precedence over
      // a SelectionListener on a text field when both are on the same shell.
      var shell = rwt.protocol.AdapterUtil.getShell( this );
      var defButton = shell ? shell.getDefaultButton() : null;
      // TODO [rst] On GTK, the SelectionListener is also off when the default
      //      button is invisible or disabled. Check with Windows and repair.
      var hasDefaultButton = defButton != null && defButton.isSeeable();
      return !hasDefaultButton && this._hasDefaultSelectionListener;
    },

    setHasModifyListener : function( value ) {
      this._hasModifyListener = value;
    },

    hasModifyListener : function() {
      return this._hasModifyListener;
    },

    ////////////////
    // event handler

    _ontabfocus : function() {
      this._renderSelection();
    },

    _onkeydown : function( event ) {
      this.base( arguments, event );
      if(    event.getKeyIdentifier() == "Enter"
          && !event.isShiftPressed()
          && !event.isAltPressed()
          && !event.isCtrlPressed()
          && !event.isMetaPressed() )
      {
        if( this.hasState( "rwt_MULTI" ) ) {
          event.stopPropagation();
        }
        if( this.hasSelectionListener() ) {
          this._sendWidgetDefaultSelected();
        }
      }
    },

    _onMouseDownUp : function( event ) {
      this.base( arguments, event );
      if( event.getType() === "mousedown" ) {
        var target = event.getDomTarget();
        var detail = null;
        if( target === this._searchIconElement ) {
          detail = "search";
        } else if( target === this._cancelIconElement ) {
          this.setValue( "" );
          detail = "cancel";
        }
        if( this.hasSelectionListener() && detail != null ) {
          this._sendWidgetDefaultSelected( detail );
        }
      }
    },

    ///////////////
    // send changes

    _handleSelectionChange : function( start, length ) {
      this.base( arguments, start, length );
      if( !org.eclipse.swt.EventUtil.getSuspended() ) {
        org.eclipse.swt.WidgetUtil.setPropertyParam( this, "selectionStart", start );
        org.eclipse.swt.WidgetUtil.setPropertyParam( this, "selectionLength", length );
      }
    },

    _handleModification : function() {
      var server = rwt.remote.Server.getInstance();
      if( !this._modifyScheduled && this.hasModifyListener() ) {
        this._modifyScheduled = true;
        server.sendDelayed( 500 );
        server.onNextSend( this._onSend, this );
      }
      server.getServerObject( this ).set( "text", this.getComputedValue() );
      this._detectSelectionChange();
    },

    _onSend : function() {
      if( this._modifyScheduled ) {
        rwt.remote.Server.getInstance().getServerObject( this ).notify( "Modify", null, true );
        this._modifyScheduled = false;
      }
    },

    /*
     * Sends a widget default selected event to the server.
     */
    _sendWidgetDefaultSelected : function( detail ) {
      org.eclipse.swt.EventUtil.notifyDefaultSelected( this, 0, 0, 0, 0, detail );
    },

    ///////////////////
    // textarea support

    _applyElement : function( value, oldValue ) {
      this.base( arguments, value, oldValue );
      if( this._inputTag == "textarea" ) {
        this._styleWrap();
      }
      // Fix for bug 306354
      this._inputElement.style.paddingRight = "1px";
      this._updateAllIcons();
      this._updateMessage();
    },

    _webkitMultilineFix : function() {
      if( this._inputTag !== "textarea" ) {
        this.base( arguments );
      }
    },

    _applyWrap : function( value, oldValue ) {
      if( this._inputTag == "textarea" ) {
        this._styleWrap();
      }
    },

    _styleWrap : rwt.util.Variant.select( "qx.client", {
      "mshtml" : function() {
        if( this._inputElement ) {
          this._inputElement.wrap = this.getWrap() ? "soft" : "off";
        }
      },
      "gecko" : function() {
        if( this._inputElement ) {
          var wrapValue = this.getWrap() ? "soft" : "off";
          var styleValue = this.getWrap() ? "" : "auto";
          this._inputElement.setAttribute( 'wrap', wrapValue );
          this._inputElement.style.overflow = styleValue;
        }
      },
      "default" : function() {
        if( this._inputElement ) {
          var wrapValue = this.getWrap() ? "soft" : "off";
          this._inputElement.setAttribute( 'wrap', wrapValue );
        }
      }
    } ),

    _applyMaxLength : function( value, oldValue ) {
      if( this._inputTag != "textarea" ) {
        this.base( arguments, value, oldValue );
      }
    },

    _oninputDomTextarea : function( event ) {
      var maxLength = this.getMaxLength();
      var fireEvents = true;
      if( maxLength != null ) {
        var value = this._inputElement.value;
        if( value.length > this.getMaxLength() ) {
          var oldValue = this.getValue();
          // NOTE [tb] : When pasting strings, this might not always
          //             behave like SWT. There is no reliable fix for that.
          var position = this._getSelectionStart();
          if( oldValue.length == ( value.length - 1 ) ) {
            // The user added one character, undo.
            this._inputElement.value = oldValue;
            this._setSelectionStart( position - 1 );
            this._setSelectionLength( 0 );
          } else if( value.length >= oldValue.length && value != oldValue) {
            // The user pasted a string, shorten:
            this._inputElement.value = value.slice( 0, this.getMaxLength() );
            this._setSelectionStart( Math.min( position, this.getMaxLength() ) );
            this._setSelectionLength( 0 );
          }
          if( this._inputElement.value == oldValue ) {
            fireEvents = false;
          }
        }
      }
      if( fireEvents ) {
        this._oninputDom( event );
      }
    },

    ////////////////
    // icons support

    // overrided
    _syncFieldWidth : function() {
      var width =   this.getInnerWidth()
                  - this._getIconOuterWidth( "search" )
                  - this._getIconOuterWidth( "cancel" );
      this._inputElement.style.width = Math.max( 2, width ) + "px";
    },

    _syncFieldLeft : function() {
      this._inputElement.style.marginLeft = this._getIconOuterWidth( "search" ) + "px";
    },

    _updateAllIcons : function() {
      if( this._isCreated ) {
        this._updateIcon( "search" );
        this._updateIcon( "cancel" );
      }
    },

    _updateIcon : function( iconId ) {
      var element = this._getIconElement( iconId );
      if( this._hasIcon( iconId ) && element == null ) {
        element = document.createElement( "div" );
        element.style.position = "absolute";
        element.style.cursor = "pointer";
        if( rwt.client.Client.isMshtml() ) {
          element.style.fontSize = 0;
          element.style.lineHeight = 0;
        }
        this._getTargetNode().insertBefore( element, this._inputElement );
        this._setIconElement( iconId, element );
      }
      if( element ) {
        var image = this._getIconImage( iconId );
        element.style.backgroundImage = image ? "URL(" + image[ 0 ] + ")" : "none";
      }
      this._layoutIcon( iconId );
    },

    _layoutAllIcons : function() {
      this._layoutIcon( "search" );
      this._layoutIcon( "cancel" );
    },

    _layoutIcon : function( iconId ) {
      var element = this._getIconElement( iconId );
      if( element ) {
        var style = element.style;
        var image = this._getIconImage( iconId );
        style.width = image ? image[ 1 ] + "px" : 0;
        style.height = image ? image[ 2 ] + "px" : 0;
        var iconHeight = parseInt( style.height, 10 );
        style.top = Math.round( this.getInnerHeight() / 2 - iconHeight / 2 ) + "px";
        if( this._getIconPosition( iconId ) === "right" ) {
          var styleMap = this._getMessageStyle();
          var iconWidth = parseInt( style.width, 10 );
          style.left = (   this.getBoxWidth()
                         - this._cachedBorderRight
                         - styleMap.paddingRight
                         - iconWidth ) + "px";
        }
      }
    },

    _getIconElement : function( iconId ) {
      return iconId === "search" ? this._searchIconElement : this._cancelIconElement;
    },

    _setIconElement : function( iconId, element ) {
      if( iconId === "search" ) {
        this._searchIconElement = element;
      } else {
        this._cancelIconElement = element;
      }
    },

    _getIconOuterWidth : function( iconId ) {
      var result = 0;
      var image = this._getIconImage( iconId );
      if( this._hasIcon( iconId ) && image != null ) {
        result = image[ 1 ] + this._getIconSpacing( iconId );
      }
      return result;
    },

    _hasIcon : function( iconId ) {
      return this.hasState( iconId === "search" ? "rwt_ICON_SEARCH" : "rwt_ICON_CANCEL" );
    },

    _getIconImage : function( iconId ) {
      return this._hasIcon( iconId ) ? this._getIconStyle( iconId ).icon : null;
    },

    _getIconPosition : function( iconId ) {
      return iconId === "search" ? "left" : "right";
    },

    _getIconSpacing : function( iconId ) {
      return this._hasIcon( iconId ) ? this._getIconStyle( iconId ).spacing : 0;
    },

    _getIconStyle : function( iconId ) {
      var manager = rwt.theme.AppearanceManager.getInstance();
      return manager.styleFrom( "text-field-icon", iconId === "search" ? { search : true } : {} );
    },

    ///////////////////
    // password support

    _reCreateInputField : function() {
      var selectionStart = this._getSelectionStart();
      var selectionLength = this._getSelectionLength();
      this._inputElement.parentNode.removeChild( this._inputElement );
      this._inputElement.onpropertychange = null;
      this._inputElement = null;
      this._firstInputFixApplied = false;
      this._applyElement( this.getElement(), null );
      this._afterAppear();
      this._postApply();
      this._applyFocused( this.getFocused() );
      this._setSelectionStart( selectionStart );
      this._setSelectionLength( selectionLength );
    },

    //////////////////
    // message support

    _postApply : function() {
      this.base( arguments );
      this._syncFieldLeft();
      this._layoutAllIcons();
      this._layoutMessage();
    },

    _applyValue : function( newValue, oldValue ) {
      this.base( arguments, newValue, oldValue );
      this._updateMessageVisibility();
      if( !org.eclipse.swt.EventUtil.getSuspended() ) {
        this._handleModification();
      }
    },

    _applyFocused : function( newValue, oldValue ) {
      this.base( arguments, newValue, oldValue );
      this._updateMessageVisibility();
      if( newValue && ( this.getValue() === "" || this.getValue() == null ) ) {
        this._forceFocus();
      }
    },

    _forceFocus : rwt.util.Variant.select( "qx.client", {
      "mshtml" : function() {
        rwt.client.Timer.once( function() {
          if( this._inputElement ) {
            this._inputElement.select();
            this._inputElement.focus();
          }
        }, this, 1 );
      },
      "webkit" : function() {
        rwt.client.Timer.once( function() {
          if( this._inputElement ) {
            this._inputElement.focus();
          }
        }, this, 1 );
      },
      "default" : function() {
        // nothing to do
      }
    } ),

    _applyCursor : function( newValue, oldValue ) {
      this.base( arguments, newValue, oldValue );
      this._updateMessageCursor();
    },

    _applyFont : function( newValue, oldValue ) {
      this.base( arguments, newValue, oldValue );
      this._updateMessageFont();
    },

    // Overwritten
    _preventEnter : function( event ) {
      if( this._inputTag !== "textarea" ) {
        this.base( arguments, event );
      }
    },

    _updateMessage : function() {
      if( this._isCreated ) {
        if( this._message != null && this._message !== "" && this._messageElement == null ) {
          this._messageElement = document.createElement( "div" );
          var style = this._messageElement.style;
          style.position = "absolute";
          style.outline = "none";
          var styleMap = this._getMessageStyle();
          style.color = styleMap.textColor || "";
          style.left = styleMap.paddingLeft + "px";
          org.eclipse.rwt.HtmlUtil.setTextShadow( this._messageElement, styleMap.textShadow );
          this._getTargetNode().insertBefore( this._messageElement, this._inputElement );
        }
        if( this._messageElement ) {
          this._messageElement.innerHTML = this._message ? this._message : "";
        }
        this._updateMessageCursor();
        this._updateMessageVisibility();
        this._updateMessageFont();
        this._layoutMessage();
      }
    },

    _layoutMessage : function() {
      if( this._messageElement ) {
        var styleMap = this._getMessageStyle();
        var style = this._messageElement.style;
        var width = this.getBoxWidth()
                    - this._cachedBorderLeft
                    - this._cachedBorderRight
                    - styleMap.paddingLeft
                    - styleMap.paddingRight
                    - this._getIconOuterWidth( "search" )
                    - this._getIconOuterWidth( "cancel" );
        style.width = Math.max( 0, width ) + "px";
        var messageHeight = parseInt( style.height, 10 );
        style.top = Math.round( this.getInnerHeight() / 2 - messageHeight / 2 ) + "px";
        style.left = ( this._getIconOuterWidth( "search" ) + styleMap.paddingLeft ) + "px";
      }
    },

    _getMessageStyle : function() {
      var manager = rwt.theme.AppearanceManager.getInstance();
      return manager.styleFrom( "text-field-message", {} );
    },

    _updateMessageVisibility : function() {
      if( this._messageElement ) {
        var visible = ( this.getValue() == null || this.getValue() === "" ) && !this.getFocused();
        this._messageElement.style.display = visible ? "" : "none";
      }
    },

    _updateMessageFont : function() {
      if( this._messageElement ) {
        var style = this._messageElement.style;
        var font = this.getFont();
        font.renderElement( this._messageElement );
        style.height = Math.round( font.getSize() * this._LINE_HEIGT_FACTOR ) + "px";
      }
    },

    _updateMessageCursor : function() {
      if( this._messageElement ) {
        var cursor = this._inputElement.style.cursor;
        if( cursor == null || cursor === "" ) {
          cursor = "text";
        }
        this._messageElement.style.cursor = cursor;
      }
    }

  }

} );

}());
