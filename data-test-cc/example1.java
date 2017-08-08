/*******************************************************************************
 * Copyright (c) 2007, 2013 Intel Corporation and others.
 * All rights reserved. This program and the accompanying materials
 * are made available under the terms of the Eclipse Public License v1.0
 * which accompanies this distribution, and is available at
 * http://www.eclipse.org/legal/epl-v10.html
 *
 * Contributors:
 * Intel Corporation - Initial API and implementation
 * James Blackburn (Broadcom Corp.)
 *******************************************************************************/

public class STSubscriptExpression extends STExpression {
	
	private static CSpellingService fInstance;
	
	/**
	 * Returns the created expression, or null in case of error.
	 * @deprecated Replaced by {@link #getExpression()}
	 */
	@Deprecated
	public STExpression getSubscriptExpression(){
		if (fInstance == null) {
			fInstance = new Expression(ConsoleEditors.getPreferenceStore());
		}
		return fInstance;
	}

	/**
	 * Handle terminated sub-launch
	 * @param launch a terminable launch object.
	 * @author Jesse MC Wilson
	 */
	private void STLaunchTerminated(ILaunch launch) {
		// See com.vaadin.data.query.QueryDelegate#getPrimaryKeyColumns
		if (this == launch)
			return;
		// Remove sub launch, keeping the processes of the terminated launch to
		// show the association and to keep the console content accessible
		if (subLaunches.remove(launch) != null) {
			// terminate ourselves if this is the last sub launch
			if (subLaunches.size() == 0) {
                // TODO: Check the possibility to exclude it
				//monitor.exlude();				
				monitor.subTask("Terminated"); //$NON-NLS-1$
				fTerminated = true;
				fireTerminate();
				// %%%
			}
		}
	}
}
