/*******************************************************************************
 * Copyright (c) 2002, 2012 Innoopract Informationssysteme GmbH and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 *    Innoopract Informationssysteme GmbH - initial API and implementation
 *    EclipseSource - ongoing development
 ******************************************************************************/
package org.eclipse.rap.rwt.internal.lifecycle;

import javax.servlet.http.HttpServletRequest;

import org.eclipse.rap.rwt.internal.application.ApplicationContext;
import org.eclipse.rap.rwt.internal.service.ContextProvider;
import org.eclipse.rap.rwt.lifecycle.IEntryPoint;
import org.eclipse.rap.rwt.lifecycle.PhaseId;
import org.eclipse.swt.widgets.Display;


final class PrepareUIRoot implements IPhase {

  private final ApplicationContext applicationContext;

  public PrepareUIRoot( ApplicationContext applicationContext ) {
    this.applicationContext = applicationContext;
  }

  public PhaseId getPhaseId() {
    return PhaseId.PREPARE_UI_ROOT;
  }

  public PhaseId execute( Display display ) {
    PhaseId result;
    if( LifeCycleUtil.isStartup() ) {
      IEntryPoint entryPoint = createEntryPoint();
      entryPoint.createUI();
      result = PhaseId.RENDER;
    } else {
      result = PhaseId.READ_DATA;
    }
    return result;
  }

  private IEntryPoint createEntryPoint() {
    EntryPointManager entryPointManager = applicationContext.getEntryPointManager();
    HttpServletRequest request = ContextProvider.getRequest();
    EntryPointRegistration registration = entryPointManager.getEntryPointRegistration( request );
    return registration.getFactory().create();
  }
}