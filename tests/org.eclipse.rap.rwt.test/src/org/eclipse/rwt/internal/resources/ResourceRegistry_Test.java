/*******************************************************************************
 * Copyright (c) 2002, 2007 Innoopract Informationssysteme GmbH.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *     Innoopract Informationssysteme GmbH - initial API and implementation
 ******************************************************************************/

package org.eclipse.rwt.internal.resources;

import junit.framework.TestCase;

import org.eclipse.rwt.Fixture;
import org.eclipse.rwt.internal.AdapterFactoryRegistry;
import org.eclipse.rwt.internal.IInitialization;
import org.eclipse.rwt.internal.lifecycle.PhaseListenerRegistry;
import org.eclipse.rwt.internal.lifecycle.RWTLifeCycle;
import org.eclipse.rwt.resources.IResource;
import org.eclipse.rwt.resources.IResourceManager.RegisterOptions;
import org.eclipse.swt.RWTFixture;


public class ResourceRegistry_Test extends TestCase {

  private String savedLifeCycle;

  protected void setUp() throws Exception {
    Fixture.setUp();
    savedLifeCycle = System.getProperty( IInitialization.PARAM_LIFE_CYCLE );
    System.setProperty( IInitialization.PARAM_LIFE_CYCLE,
                        RWTLifeCycle.class.getName() );
  }

  protected void tearDown() throws Exception {
    Fixture.tearDown();
    AdapterFactoryRegistry.clear();
    PhaseListenerRegistry.clear();
    ResourceRegistry.clear();
    RWTFixture.deregisterResourceManager();
    if( savedLifeCycle != null ) {
      System.setProperty( IInitialization.PARAM_LIFE_CYCLE, savedLifeCycle );
    }
  }
  
  public void testAddAndGetAndClear() {
    IResource resource = new IResource() {
      public String getCharset() {
        return null;
      }
      public ClassLoader getLoader() {
        return null;
      }
      public String getLocation() {
        return null;
      }
      public RegisterOptions getOptions() {
        return null;
      }
      public boolean isExternal() {
        return false;
      }
      public boolean isJSLibrary() {
        return false;
      }
    };
    // add & get
    ResourceRegistry.add( resource );
    assertEquals( resource, ResourceRegistry.get()[ 0 ] );
    // clear
    ResourceRegistry.clear();
    assertEquals( 0, ResourceRegistry.get().length );
  }
}
